import validate_class_code, { process_code, reset_existing_code } from './validate_class_code'

describe('validate_class_code', () => {
  describe('when code is invalid', () => {
    it.each([
      ['null', null],
      ['empty string', ''],
      ['all white spaces', '      '],
      ['over 6 characters long', 'aaaaaaa'],
      ['less than 6 characters long', 'aaaaa'],
      ['non-alphanumeric', 'aaa12+'],
    ])('should return false when code is %s', (description: string, code: string) => {
      expect(validate_class_code(code, [], [])).toBe(false)
    })
  })

  describe('when code already exists', () => {
    it.each([
      ['AAA123', ['aAa123']],
      ['123aAa', ['foobar', '123A', '123aaA']],
    ])('should return false when code %s already exists in %s', (code: string, existing_codes: string[]) => {
      expect(validate_class_code(code, [], existing_codes)).toBe(false)
    })
  })

  describe('when code contains distracting word in consecutive order', () => {
    it.each([
      ['RATS42', ['rats']],
      ['ARATS2', ['rats']],
      ['24RATS', ['darn', 'rats']],
    ])('should return false when code %s contains distracting word in %s', (code: string, distracting_words: string[]) => {
      expect(validate_class_code(code, distracting_words, [])).toBe(false)
    })
  })

  describe('when code contains distracting word in non-consecutive order', () => {
    it.each([
      ['RA1TSF', ['rats']],
      ['3RQATS', ['rats']],
      ['3RA2TS', ['darn', 'rats']],
      ['aU7T77', ['rats', '877', '777']],
    ])('should return false when code %s contains distracting word in %s', (code: string, distracting_words: string[]) => {
      expect(validate_class_code(code, distracting_words, [])).toBe(false)
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
      expect(validate_class_code(code, distracting_words, [])).toBe(true)
    })
  })

  describe('when code does not contain any distracting word by (non-)consecutive order and does not exist already', () => {
    it.each([
      ['RAT123', ['rats'], []],
      ['R1A2T3', ['rats'], []],
      ['TSR1A2', ['rats'], []],
      ['TS12RA', ['', '   ', '+-.', 'abCdEfG', 'rats'], []],
      ['AEU7CH', ['darn', 'rats', 'egg', 'fuzzy', 'kthx', 'haha', 'ugh', '777', 'cheese'], ['aeU7cI']],
      ['aU7T87', ['rats', '877', '777'], ['aU7T78', 'bU7T77']],
    ])('should return true when code %s, distracting words in %s, and existing codes in %s', (code: string, distracting_words: string[], existing_codes: string[]) => {
      expect(validate_class_code(code, distracting_words, existing_codes)).toBe(true)
    })
  })
})

describe('process_code', () => {
  describe('when code does not contain distracting words', () => {
    it('should return true when there is no existing code', () => {
      expect(process_code('RAT123', ['rats'])).toBe(true)
    })
    it('should return false when same code is validated twice', () => {
      reset_existing_code()
      expect(process_code('RAT123', ['rats'])).toBe(true)
      expect(process_code('RAT123', ['rats'])).toBe(false)
    })
  })

})
