import ClassCodeValidator from './class_code_validator'

describe('ClassCodeValidator', () => {
  describe('when code is invalid', () => {
    it.each([
      ['null', null],
      ['empty string', ''],
      ['all white spaces', '      '],
      ['over 6 characters long', 'aaaaaaa'],
      ['less than 6 characters long', 'aaaaa'],
      ['non-alphanumeric', 'aaa12+'],
    ])('should return false when code is %s (%s)', (description: string, code: string) => {
      const validator = new ClassCodeValidator([])
      expect(validator.validate(code)).toBe(false)
    })
  })

  describe('when validating same code multiple times', () => {
    it('should return true only once and false in subsequent calls', () => {
      const validator = new ClassCodeValidator([])
      expect(validator.validate('AAA123')).toBe(true)
      expect(validator.validate('aAa123')).toBe(false)
      expect(validator.validate('AAA123')).toBe(false)
    })
  })

  describe('when code contains distracting word in consecutive order', () => {
    it.each([
      ['RATS42', ['rats']],
      ['ARATS2', ['rats']],
      ['24RATS', ['darn', 'rats']],
    ])('should return false when code %s contains distracting word in %s', (code: string, distracting_words: string[]) => {
      const validator = new ClassCodeValidator(distracting_words)
      expect(validator.validate(code)).toBe(false)
    })
  })

  describe('when code contains distracting word in non-consecutive order', () => {
    it.each([
      ['RA1TSF', ['rats']],
      ['3RQATS', ['rats']],
      ['3RA2TS', ['darn', 'darnit', 'rats']],
      ['aU7T77', ['rats', '877', '777']],
    ])('should return false when code %s contains distracting word in %s', (code: string, distracting_words: string[]) => {
      const validator = new ClassCodeValidator(distracting_words)
      expect(validator.validate(code)).toBe(false)
    })
  })

  describe('when all distracting words are invalid', () => {
    it.each([
      ['ABCDEF', ['']],
      ['ABCDEF', ['   ']],
      ['ABCDEF', ['+-.']],
      ['ABCDEF', ['abCdEfG']],
      ['ABCDEF', ['abCdEfG', 'ABcDeFgH']],
    ])('should return true when code %s and distracting words in %s', (code: string, distracting_words: string[]) => {
      const validator = new ClassCodeValidator(distracting_words)
      expect(validator.validate(code)).toBe(true)
    })
  })

  describe('when code does not contain any distracting word by (non-)consecutive order', () => {
    it.each([
      ['RAT123', ['rats']],
      ['R1A2T3', ['rats']],
      ['TSR1A2', ['rats']],
      ['TS12RA', ['', '   ', '+-.', 'abCdEfG', 'rats']],
      ['AEU7CH', ['darn', 'rats', 'egg', 'fuzzy', 'kthx', 'haha', 'ugh', '777', 'cheese']],
      ['aU7T87', ['rats', '877', '777']],
    ])('should return true when code %s, distracting words in %s, and existing codes in %s', (code: string, distracting_words: string[]) => {
      const validator = new ClassCodeValidator(distracting_words)
      expect(validator.validate(code)).toBe(true)
    })
  })
})