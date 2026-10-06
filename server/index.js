import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { isOfficialCandidate, scoreCandidate } from './detection.js';
import { fetchBrandProfile, searchBrandCandidates } from './gemini.js';

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json({ limit: '500kb' }));

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: String,
  description: String,
  industry: String,
  logoUrl: String,
  officialSocials: [{ platform: String, handle: String }],
  officialApps: [{ store: String, name: String, appId: String, publisher: String }],
}, { timestamps: true });

const findingSchema = new mongoose.Schema({
  type: { type: String, enum: ['social', 'app'], required: true },
  name: String,
  handle: String,
  platform: String,
  source: String,
  sourceUrl: String,
  sourceTitle: String,
  followers: String,
  publisher: String,
  category: String,
  detected: String,
  score: Number,
  signals: [String],
  status: { type: String, default: 'New' },
  externalId: String,
}, { timestamps: true });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
const Finding = mongoose.models.Finding || mongoose.model('Finding', findingSchema);

let brand = {
  name: 'Northstar',
  domain: 'northstar.com',
  description: 'A modern financial platform helping people move money with confidence.',
  industry: 'Fintech & Wealth',
  logoUrl: 'https://www.google.com/s2/favicons?domain=northstar.com&sz=128',
  officialSocials: [
    { platform: 'Instagram', handle: '@northstar' },
    { platform: 'X', handle: '@northstarhq' },
    { platform: 'LinkedIn', handle: 'northstar-inc' },
  ],
  officialApps: [
    { store: 'App Store', name: 'Northstar: Money, made clear', appId: 'id6478214501', publisher: 'Northstar Financial, Inc.' },
    { store: 'Google Play', name: 'Northstar', appId: 'com.northstar.mobile', publisher: 'Northstar Financial, Inc.' },
  ],
};

let findings = [
  { id: 'sg-1042', type: 'social', name: 'Northstar Support', handle: '@northstar_helpdesk', platform: 'Instagram', source: 'Instagram', followers: '2,480', category: 'Customer support scam', detected: '8 min ago', score: 96, signals: ['Look-alike name', 'Brand logo detected', 'Support language in bio'], status: 'New', externalId: '@northstar_helpdesk', sourceUrl: 'https://instagram.com/northstar_helpdesk', sourceTitle: 'Northstar Helpdesk' },
  { id: 'sg-1041', type: 'app', name: 'NorthStar Wallet & Rewards', publisher: 'Star Mobile Labs', platform: 'Google Play', source: 'Google Play', followers: '10K+ downloads', category: 'Impersonating app', detected: '23 min ago', score: 91, signals: ['Brand logo detected', 'Unrecognized publisher', 'Northstar in description'], status: 'New', externalId: 'com.starmobile.northwallet', sourceUrl: 'https://play.google.com/store/apps/details?id=com.starmobile.northwallet', sourceTitle: 'NorthStar Wallet' },
  { id: 'sg-1040', type: 'social', name: 'Northstar Official', handle: '@northstar.giveaway', platform: 'X', source: 'X', followers: '816', category: 'Investment scam', detected: '1 hr ago', score: 88, signals: ['Look-alike name', 'Added promotional keyword', 'Suspicious link in bio'], status: 'Reviewing', externalId: '@northstar.giveaway', sourceUrl: 'https://x.com/northstar.giveaway', sourceTitle: 'Northstar Giveaway' },
  { id: 'sg-1039', type: 'app', name: 'North Star - Fast Transfer', publisher: 'Blue Peak Digital', platform: 'App Store', source: 'App Store', followers: '4.8 rating', category: 'Brand impersonation', detected: '2 hr ago', score: 82, signals: ['Spacing variation', 'Unrecognized publisher', 'Similar visual identity'], status: 'New', externalId: 'id6742081653', sourceUrl: 'https://apps.apple.com/app/id6742081653', sourceTitle: 'North Star Fast Transfer' },
  { id: 'sg-1038', type: 'social', name: 'Northstar Careers', handle: '@northstar.careers', platform: 'Facebook', source: 'Facebook', followers: '1,205', category: 'Recruitment scam', detected: '3 hr ago', score: 76, signals: ['Look-alike name', 'Job offers requested via DM'], status: 'New', externalId: '@northstar.careers', sourceUrl: 'https://facebook.com/northstar.careers', sourceTitle: 'Northstar Careers' },
  { id: 'sg-1037', type: 'social', name: 'Northstɑr Finance', handle: '@northstar_finance', platform: 'TikTok', source: 'TikTok', followers: '5,120', category: 'Phishing profile', detected: '5 hr ago', score: 69, signals: ['Look-alike character', 'Brand terms in bio'], status: 'Dismissed', externalId: '@northstar_finance', sourceUrl: 'https://tiktok.com/@northstar_finance', sourceTitle: 'Northstar Finance' },
  { id: 'sg-1036', type: 'app', name: 'Northstar Pay+', publisher: 'N. Star Apps', platform: 'Google Play', source: 'Google Play', followers: '5K+ downloads', category: 'Unauthorized app', detected: 'Yesterday', score: 65, signals: ['Added keyword', 'Unrecognized publisher'], status: 'New', externalId: 'com.nstar.payplus', sourceUrl: 'https://play.google.com/store/apps/details?id=com.nstar.payplus', sourceTitle: 'Northstar Pay+' },
];

const hasDatabase = () => mongoose.connection.readyState === 1;

async function getBrand() {
  if (!hasDatabase()) return brand;
  let savedBrand = await Brand.findOne();
  if (!savedBrand) savedBrand = await Brand.create(brand);
  brand = savedBrand.toObject();
  return brand;
}

async function getFindings() {
  if (!hasDatabase()) return findings;
  const savedFindings = await Finding.find().sort({ score: -1 }).lean();
  if (savedFindings.length) return savedFindings.map((finding) => ({ ...finding, id: finding._id.toString() }));
  await Finding.insertMany(findings.map(({ id, ...finding }) => finding));
  const seededFindings = await Finding.find().sort({ score: -1 }).lean();
  return seededFindings.map((finding) => ({ ...finding, id: finding._id.toString() }));
}

app.get('/api/health', async (_request, response) => {
  const activeBrand = await getBrand();
  response.json({
    status: 'ok',
    database: hasDatabase() ? 'connected' : 'in-memory demo mode',
    scanMode: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    brand: activeBrand.name,
  });
});

app.get('/api/brand', async (_request, response, next) => {
  try {
    response.json(await getBrand());
  } catch (error) {
    next(error);
  }
});

// Dynamic brand intelligence lookup & switch
app.post('/api/brand/lookup', async (request, response, next) => {
  try {
    const { brandName } = request.body;
    if (!brandName || typeof brandName !== 'string' || !brandName.trim()) {
      return response.status(400).json({ error: 'A brand name is required.' });
    }

    const trimmed = brandName.trim();
    let newBrandProfile;

    if (process.env.GEMINI_API_KEY) {
      console.log(`[Gemini] Looking up brand profile for: "${trimmed}"`);
      newBrandProfile = await fetchBrandProfile(trimmed);
    } else {
      const cleanDomain = `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      newBrandProfile = {
        name: trimmed,
        domain: cleanDomain,
        description: `Official digital presence and protection profile for ${trimmed}.`,
        industry: 'Enterprise & Commerce',
        logoUrl: `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`,
        officialSocials: [
          { platform: 'Instagram', handle: `@${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
          { platform: 'X', handle: `@${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}hq` },
          { platform: 'LinkedIn', handle: `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}-official` },
        ],
        officialApps: [
          { store: 'App Store', name: `${trimmed} Mobile`, appId: `id${Math.floor(1000000000 + Math.random() * 9000000000)}`, publisher: `${trimmed}, Inc.` },
          { store: 'Google Play', name: trimmed, appId: `com.${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`, publisher: `${trimmed}, Inc.` },
        ],
      };
    }

    brand = newBrandProfile;
    if (hasDatabase()) {
      const savedBrand = await Brand.findOneAndUpdate({}, brand, { upsert: true, new: true, runValidators: true });
      brand = savedBrand.toObject();
    }

    // Automatically trigger threat scan for the new brand
    console.log(`[Gemini] Scanning threats for new brand: "${brand.name}"`);
    let rawCandidates = [];
    let sources = [];

    if (process.env.GEMINI_API_KEY) {
      const scanResults = await searchBrandCandidates(brand);
      rawCandidates = scanResults.candidates;
      sources = scanResults.sources;
    }

    const filtered = (rawCandidates || []).filter((candidate) => !isOfficialCandidate(candidate, brand));
    const scored = filtered.map((candidate) => {
      const result = scoreCandidate(candidate, brand);
      return {
        ...candidate,
        ...result,
        score: Math.max(candidate.score || 70, result.score),
        signals: [...new Set([...(candidate.signals || []), ...result.signals])],
      };
    });

    const newFindings = scored.map((candidate, idx) => ({
      id: `threat-${Date.now()}-${idx}`,
      type: candidate.type,
      name: candidate.name,
      handle: candidate.handle,
      platform: candidate.platform,
      source: candidate.platform,
      sourceUrl: candidate.sourceUrl,
      sourceTitle: candidate.sourceTitle,
      followers: candidate.followers,
      publisher: candidate.publisher,
      category: candidate.category,
      detected: candidate.detected || 'Just now',
      score: candidate.score,
      signals: candidate.signals,
      status: 'New',
      externalId: candidate.externalId,
    }));

    findings = newFindings;

    if (hasDatabase()) {
      try {
        await Finding.deleteMany({});
        if (newFindings.length) {
          await Finding.insertMany(newFindings.map(({ id, ...f }) => f));
        }
      } catch (dbErr) {
        console.warn('[MongoDB save warning]:', dbErr.message);
      }
    }

    response.json({
      brand,
      findings,
      scanned: rawCandidates.length,
      detections: findings.length,
      sources,
      lastScan: new Date().toISOString(),
      mode: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/brand', async (request, response, next) => {
  try {
    const { name, domain, description, industry, logoUrl, officialSocials, officialApps } = request.body;
    if (!name?.trim() || !domain?.trim()) return response.status(400).json({ error: 'Brand name and domain are required.' });
    brand = {
      ...brand,
      name: name.trim(),
      domain: domain.trim(),
      description: description || '',
      industry: industry || brand.industry || 'Technology',
      logoUrl: logoUrl || `https://www.google.com/s2/favicons?domain=${domain.trim()}&sz=128`,
      officialSocials: officialSocials || [],
      officialApps: officialApps || [],
    };
    if (hasDatabase()) {
      const savedBrand = await Brand.findOneAndUpdate({}, brand, { upsert: true, new: true, runValidators: true });
      brand = savedBrand.toObject();
    }
    response.json(brand);
  } catch (error) { next(error); }
});

app.get('/api/findings', async (request, response, next) => {
  try {
    const { type, status } = request.query;
    const activeBrand = await getBrand();
    const results = await getFindings();
    response.json(
      results.filter(
        (finding) =>
          finding.score >= 55 &&
          !isOfficialCandidate(finding, activeBrand) &&
          (!type || type === 'all' || finding.type === type) &&
          (!status || status === 'all' || finding.status === status)
      )
    );
  } catch (error) { next(error); }
});

app.patch('/api/findings/:id', async (request, response, next) => {
  try {
    const { status } = request.body;
    if (!['New', 'Reviewing', 'Escalated', 'Dismissed'].includes(status)) {
      return response.status(400).json({ error: 'Invalid finding status.' });
    }
    if (hasDatabase()) {
      const finding = await Finding.findByIdAndUpdate(request.params.id, { status }, { new: true });
      if (!finding) return response.status(404).json({ error: 'Finding not found.' });
      return response.json({ ...finding.toObject(), id: finding._id.toString() });
    }
    const finding = findings.find((item) => item.id === request.params.id);
    if (!finding) return response.status(404).json({ error: 'Finding not found.' });
    finding.status = status;
    response.json(finding);
  } catch (error) { next(error); }
});

app.post('/api/scan', async (_request, response, next) => {
  try {
    const activeBrand = await getBrand();
    console.log(`[Gemini Scan] Scanning for brand: ${activeBrand.name}`);

    let liveResults = null;
    if (process.env.GEMINI_API_KEY) {
      liveResults = await searchBrandCandidates(activeBrand);
    }

    const rawCandidates = liveResults?.candidates || findings;
    const candidates = rawCandidates.filter((candidate) => !isOfficialCandidate(candidate, activeBrand));

    const scored = candidates.map((candidate) => {
      const result = scoreCandidate(candidate, activeBrand);
      return {
        ...candidate,
        ...result,
        score: Math.max(candidate.score || 65, result.score),
        signals: [...new Set([...(candidate.signals || []), ...result.signals])],
      };
    });

    const detections = scored.filter((candidate) => candidate.score >= 55).map((candidate, idx) => {
      const existing = findings.find((finding) => finding.externalId === candidate.externalId);
      const { _id, similarity, ...scoredFinding } = candidate;
      return {
        ...existing,
        ...scoredFinding,
        id: existing?.id || `threat-${Date.now()}-${idx}`,
        detected: existing?.detected || candidate.detected || 'Just now',
        status: existing?.status || 'New',
      };
    });

    if (hasDatabase()) {
      for (const finding of detections) {
        const { id, ...data } = finding;
        await Finding.findOneAndUpdate(
          { externalId: data.externalId },
          { $set: data },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    } else {
      findings = detections;
    }

    const highConfidence = detections.filter((candidate) => candidate.score >= 85).length;
    response.json({
      scanned: candidates.length,
      detections: detections.length,
      highConfidence,
      sources: liveResults?.sources || [],
      lastScan: new Date().toISOString(),
      mode: liveResults ? 'gemini' : 'demo',
    });
  } catch (error) { next(error); }
});

app.use((error, _request, response, _next) => {
  console.error('[API Error]:', error);
  const statusNum = typeof error?.status === 'number' && error.status >= 100 && error.status < 600
    ? error.status
    : (typeof error?.statusCode === 'number' && error.statusCode >= 100 && error.statusCode < 600 ? error.statusCode : 500);
  response.status(statusNum).json({ error: error.message || 'The request could not be completed.' });
});

app.listen(port, () => console.log(`SignalGuard API listening on http://localhost:${port}`));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.warn(`MongoDB unavailable; continuing in in-memory mode: ${error.message}`));
}