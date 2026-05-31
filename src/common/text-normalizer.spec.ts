import {
  normalizeFormTextFields,
  normalizeNameText,
  normalizeSentenceText,
} from './text-normalizer';

describe('text normalizer', () => {
  it('capitalizes names and initials', () => {
    expect(normalizeNameText('  k. g. saman perera  ')).toBe(
      'K. G. Saman Perera',
    );
    expect(normalizeNameText('k.g. saman perera')).toBe('K.G. Saman Perera');
    expect(normalizeNameText('nimal silva')).toBe('Nimal Silva');
  });

  it('capitalizes sentence starts after punctuation and new lines', () => {
    expect(
      normalizeSentenceText('  no 12, main road. near temple\nsecond lane  '),
    ).toBe('No 12, main road. Near temple\nSecond lane');
  });

  it('normalizes nested form data while preserving ids, phones, and status', () => {
    const result = normalizeFormTextFields({
      fullNameWithSurname: 'kamal perera',
      nameWithInitials: 'k. a. perera',
      address: 'kandy road. near school',
      phone1: ' 0771234567 ',
      status: 'PENDING',
      siblings: [{ name: 'sunil silva', grade: '3' }],
    });

    expect(result).toEqual({
      fullNameWithSurname: 'Kamal Perera',
      nameWithInitials: 'K. A. Perera',
      address: 'Kandy road. Near school',
      phone1: '0771234567',
      status: 'PENDING',
      siblings: [{ name: 'Sunil Silva', grade: '3' }],
    });
  });
});
