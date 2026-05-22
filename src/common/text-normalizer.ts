/* eslint-disable @typescript-eslint/no-unsafe-return */

const EXCLUDED_KEY_PARTS = [
  'id',
  'no',
  'number',
  'phone',
  'mobile',
  'date',
  'day',
  'dob',
  'status',
  'grade',
  'marks',
  'count',
  'payment',
  'agreement',
  'active',
  'monitor',
  'file',
  'image',
];

const NAME_KEY_PARTS = ['name', 'surname', 'initials'];

const SENTENCE_KEY_PARTS = [
  'address',
  'reason',
  'note',
  'medicine',
  'school',
  'job',
  'house',
  'place',
  'other',
];

function splitKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function hasPart(key: string, parts: string[]) {
  const keyParts = splitKey(key);
  return parts.some((part) => keyParts.includes(part));
}

function capitalizeFirst(value: string) {
  return value.replace(
    /^(\P{L}*)(\p{L})/u,
    (_, prefix: string, letter: string) =>
      `${prefix}${letter.toLocaleUpperCase('en-US')}`,
  );
}

export function normalizeNameText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) =>
      /^([a-z]\.)+[a-z]?\.?$/i.test(word)
        ? word.toLocaleUpperCase('en-US')
        : word
            .split('-')
            .map((part) =>
              part
                .split("'")
                .map((piece) => {
                  if (!piece) return piece;
                  if (/^[a-z](?:\.)?$/i.test(piece)) {
                    return piece.toLocaleUpperCase('en-US');
                  }

                  return capitalizeFirst(piece.toLocaleLowerCase('en-US'));
                })
                .join("'"),
            )
            .join('-'),
    )
    .join(' ');
}

export function normalizeSentenceText(value: string) {
  return value
    .trim()
    .replace(/[ \t]+/g, ' ')
    .replace(
      /(^|[.!?]\s+|\r?\n\s*)(\p{L})/gu,
      (_, prefix: string, letter: string) =>
        `${prefix}${letter.toLocaleUpperCase('en-US')}`,
    );
}

export function normalizeTextByField(key: string, value: string) {
  if (value.trim() === '') {
    return value.trim();
  }

  if (hasPart(key, EXCLUDED_KEY_PARTS)) {
    return value.trim();
  }

  if (hasPart(key, NAME_KEY_PARTS)) {
    return normalizeNameText(value);
  }

  if (hasPart(key, SENTENCE_KEY_PARTS)) {
    return normalizeSentenceText(value);
  }

  return normalizeSentenceText(value);
}

export function normalizeFormTextFields<T>(value: T, key = ''): T {
  if (typeof value === 'string') {
    return normalizeTextByField(key, value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeFormTextFields(item, key),
    ) as unknown as T;
  }

  if (!value || typeof value !== 'object' || value instanceof Date) {
    return value;
  }

  const normalized = Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      normalizeFormTextFields(entryValue, entryKey),
    ]),
  ) as unknown as T;

  return normalized;
}
