import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const metrics = Router();

metrics.get('/metrics', async (req, res) => {
  const district = String(req.query.district || '').trim();
  if (!district) return res.status(400).json({ error: 'district is required' });
  const rows = await prisma.metric.findMany({
    where: { district },
    orderBy: [{ fy: 'asc' }, { month: 'asc' }],
  });
  res.json({ metrics: rows });
});

metrics.get('/metrics/compare', async (req, res) => {
  const district = String(req.query.district || '').trim();
  if (!district) return res.status(400).json({ error: 'district is required' });
  const latest = await prisma.metric.findFirst({
    where: { district },
    orderBy: [{ month: 'desc' }, { updatedAt: 'desc' }],
  });
  if (!latest) return res.json({ district: null, stateAvg: null });

  const samePeriod = await prisma.metric.findMany({
    where: { state: latest.state, fy: latest.fy, month: latest.month },
    select: { persondaysTotal:true, householdsWorked:true, avgDaysPerHH:true,
      womenPersondaysShare:true, totalExpLakhs:true, jobcardsTotal:true, workersTotal:true }
  });

  const avg = (a:(number|null|undefined)[]) => {
    const x = a.filter((v): v is number => typeof v === 'number');
    return x.length ? x.reduce((p,c)=>p+c,0)/x.length : null;
  };
  const stateAvg = {
    persondaysTotal: avg(samePeriod.map(x=>x.persondaysTotal)),
    householdsWorked: avg(samePeriod.map(x=>x.householdsWorked)),
    avgDaysPerHH: avg(samePeriod.map(x=>x.avgDaysPerHH)),
    womenPersondaysShare: avg(samePeriod.map(x=>x.womenPersondaysShare)),
    totalExpLakhs: avg(samePeriod.map(x=>x.totalExpLakhs)),
    jobcardsTotal: avg(samePeriod.map(x=>x.jobcardsTotal)),
    workersTotal: avg(samePeriod.map(x=>x.workersTotal)),
  };
  res.json({ district: latest, stateAvg });
});
