const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}

function hasAdjacentSwap(left, right) {
  if (left.length !== right.length) return false;
  const mismatches = [];
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) mismatches.push(index);
  }
  return mismatches.length === 2
    && mismatches[1] === mismatches[0] + 1
    && left[mismatches[0]] === right[mismatches[1]]
    && left[mismatches[1]] === right[mismatches[0]];
}

export function scoreCandidate(candidate, brand) {
  const candidateName = normalize(candidate.name);
  const brandName = normalize(brand.name);
  if (!candidateName || !brandName) return { score: 0, similarity: 0, signals: [] };

  const similarity = Math.round((1 - editDistance(candidateName, brandName) / Math.max(candidateName.length, brandName.length)) * 100);
  const signals = [];
  let nameStrength = similarity;
  if (candidateName === brandName && candidate.name.toLowerCase().trim() !== brand.name.toLowerCase().trim()) {
    signals.push('Spacing or punctuation variation');
    nameStrength = 100;
  } else if (brandName.length >= 5 && candidateName.includes(brandName)) {
    signals.push('Brand name plus extra words');
    nameStrength = 88;
  } else if (brandName.length >= 5 && hasAdjacentSwap(brandName, candidateName)) {
    signals.push('Transposed characters');
    nameStrength = 90;
  } else if (similarity >= 62) {
    signals.push('Look-alike name');
  }
  if (candidate.logoMatch) signals.push('Brand logo detected');
  const description = normalize(candidate.description || '');
  if (candidate.descriptionMatch || (brandName.length >= 5 && description.includes(brandName))) signals.push('Brand language in description');
  if (candidate.publisher && brand.officialApps?.some((app) => (app.publisher || '').toLowerCase() !== candidate.publisher.toLowerCase())) {
    signals.push('Unrecognized publisher');
  }

  const score = Math.min(99, Math.round(nameStrength * 0.62 + (candidate.logoMatch ? 25 : 0) + (candidate.descriptionMatch ? 13 : 0) + (signals.includes('Unrecognized publisher') ? 12 : 0)));
  return { score, similarity, signals };
}

export function isOfficialCandidate(candidate, brand) {
  const candidateId = (candidate.externalId || '').toLowerCase();
  const officialSocials = brand.officialSocials || [];
  const officialApps = brand.officialApps || [];
  const normalizeHandle = (value = '') => value.trim().replace(/^@/, '').toLowerCase();
  return (candidate.type === 'social' && officialSocials.some((account) => normalizeHandle(account.handle) === normalizeHandle(candidateId)))
    || (candidate.type === 'app' && officialApps.some((app) => app.appId?.trim().toLowerCase() === candidateId.trim()));
}