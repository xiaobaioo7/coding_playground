enum ValidationResult {
  InvalidPattern,
  AlreadyExists,
  ContainsDistractingWord,
  Valid,
}

interface ClassCodeValidatorInterface {
  validate(code: string): boolean
}

class ClassCodeValidator implements ClassCodeValidatorInterface {
  private existingCodes: Set<string>
  private distractingWordsMap: Map<string, Set<string>>
  private invalidCodes: Set<string>
  private CODE_LENGTH = 6
  private VALID_CODE_REGEX = new RegExp(`^[a-z0-9]{${this.CODE_LENGTH}}$`, 'i')
  private VALID_DISTRACTING_WORD_REGEX = new RegExp(`^[a-z0-9]{1,${this.CODE_LENGTH}}$`, 'i')

  constructor(distractingWords: string[]) {
    this.existingCodes = new Set()
    this.invalidCodes = new Set()
    this.parseDistractingWords(distractingWords)
  }

  /**
   * Validate code (case insensitive) against existing codes and distracting words,
   * the code is valid when it meets all of the below criterias:
   * - code must match with regex pattern VALID_CODE_REGEX
   * - code is not one of existing codes already validated 
   * - The code does not contain any distracting words in consecutive or 
   *   non-consecutive order
   * When code is valid, it will be added to existing codes so that the
   * subsequent calls for the same code will be invalid.
   * Example: code "RATS42" and "3RQATS" are invalid when distracting words 
   * include "rat" and there is no existing codes.
   * @param code 
   * return boolean
   */
  public validate(code: string): boolean {
    const codeToLowercase = code?.toLowerCase()

    if (this.invalidCodes.has(codeToLowercase)) {
      return false
    }

    const validateResult = this.validateResult(codeToLowercase)
    if (validateResult == ValidationResult.Valid) {
      this.existingCodes.add(codeToLowercase)
      return true
    }

    this.invalidCodes.add(codeToLowercase)
    return false
  }
  
  /**
   * Parse distracting words list to a data structure so that:
   * - all words are sorted by length (shorter length appear at first)
   * - all words are sorted alphabetically
   * - filter out invalid words by regex pattern VALID_DISTRACTING_WORD_REGEX (if applied)
   * - convert all words to lower cases
   * - group all words with the smallest common word together. Example: haha and hahaha will be in a group
   * The data structure is a map with the key as the smallest common word, and the value as the rest of word group 
   * in a set. When we validate the code against each of the map key, if the code does not contain the key in 
   * consecutive or non-consecutive order, it skips validating against the rest of words in the group.
   * @param distractingWords 
   */
  private parseDistractingWords(distractingWords: string[]): void {
    const filteredAndSortedArray = [...distractingWords]
      .filter(word => this.VALID_DISTRACTING_WORD_REGEX.test(word))
      .map(word => word.toLowerCase())
      .sort((wordA, wordB) => (wordA.length - wordB.length) || wordA.localeCompare(wordB))
    this.distractingWordsMap = new Map()
    this.matchFullStringIntersectRecursive(this.distractingWordsMap, new Set(filteredAndSortedArray))
  }

  /**
   * Iterate through an ordered (by length and alphabetical) set of words recursively, to group all words 
   * with the smallest common word together. Store the data to the given map so that the key is the smallest
   * common word and the value is the rest of words in the group.
   * @param map 
   * @param sortedSearchSet 
   */
  private matchFullStringIntersectRecursive(
    map: Map<string, Set<string>>,
    sortedSearchSet: Set<string>,
  ): void {
    const remainingSet: Set<string> = new Set()
    let lastSearch: string
    for (const search of sortedSearchSet) {
      if (!lastSearch) {
        lastSearch = search
      }
      if (!map.has(lastSearch)) {
        map.set(lastSearch, new Set())
        continue
      }
      if (this.exists(search, lastSearch)) {
        map.get(lastSearch).add(search)
      } else {
        remainingSet.add(search)
      }
    }

    if (remainingSet.size > 0) {
      this.matchFullStringIntersectRecursive(map, remainingSet)
    }
  }

  /**
   * Compare two strings to check if first string contains second string in
   * consecutive or non-consecutive order
   * @param stringA First string
   * @param stringB Second string
   * return boolean
   */
  private exists(stringA: string, stringB: string): boolean {
    let searchPosition = 0
    for (const char of stringA) {
      if (searchPosition < stringB.length && char == stringB[searchPosition]) {
        searchPosition += 1
      }
    }
    return searchPosition == stringB.length
  }
  
  /**
   * Validate code
   * @param code Class code
   * return enum Validation result
   */
  private validateResult(code: string): ValidationResult {
    // invalid code if it does not match with regex pattern
    if (!this.VALID_CODE_REGEX.test(code)) {
      return ValidationResult.InvalidPattern
    }

    // invalid code if it already exists
    if (this.existingCodes.has(code)) {
      return ValidationResult.AlreadyExists
    }

    // loop through all distracting words and invalidate code for first matching of the word
    for (const word of this.distractingWordsMap.keys()) {
      if (this.exists(code, word)) {
        return ValidationResult.ContainsDistractingWord
      }
    }

    return ValidationResult.Valid
  }
}

export default ClassCodeValidator
