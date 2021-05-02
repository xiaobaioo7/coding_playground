const CODE_LENGTH = 6
const VALID_CODE_REGEX = new RegExp(`^[a-zA-Z0-9]{${CODE_LENGTH}}$`)

/**
 * Validate class code against existing codes and distracting words,
 * the code is valid when it meets all of the below criterias:
 * - code is not empty or null
 * - code must match with regex pattern VALID_CODE_REGEX
 * - code is not one of existing codes (case insensitive)
 * - The code does not contain any distracting words in consecutive or 
 *   non-consecutive order (case insensitive)
 * Example: code "RATS42" and "3RQATS" are invalid when distracting words 
 * include "rat" and there is no existing codes.
 * @param code 
 * @param distracting_words 
 * @param existing_codes 
 * return boolean
 */
function validate_class_code(
  code: string,
  distracting_words: string[],
  existing_codes: string[],
) : boolean {
  // invalid code if it's falsy (null or empty string)
  if (!code) {
    return false
  }

  // invalid code if it does not match with regex pattern
  if (!VALID_CODE_REGEX.test(code)) {
    return false
  }

  // invalid code if it already exists
  const codeToLowercase = code.toLowerCase()
  const codeLength = code.length
  const existingMatchingCode = existing_codes.find((existing_code) => existing_code.toLowerCase() === codeToLowercase)
  if (existingMatchingCode) {
    return false
  }

  // loop through all distracting words and invalidate code for first occurrance of the word
  for (let word of distracting_words) {
    const wordLength = word.length
    // word's length is longer code's, skip to next word 
    if (wordLength > codeLength) {
      continue
    }

    const wordToLowercase = word.toLowerCase()

    // loop through each word's character to find matching in code
    let lastSearchIndex = 0
    for (let i = 0; i < wordLength; i++) {
      const char = wordToLowercase[i]
      const matchCodeIndex = codeToLowercase.indexOf(char, lastSearchIndex)

      // no matching in code for given char of word, should skip to next word
      if (matchCodeIndex === -1) {
        break
      }

      // finish looking up all chars of word, should consider to have found matching in code
      if (i == wordLength - 1) {
        return false
      }

      /**
       * search ends at last char of code and there's still more word char to look up,
       * should skip to next word
       */
      if (matchCodeIndex == codeLength - 1) {
        break
      }

      // move on to next word's char and continue searching in code
      lastSearchIndex = matchCodeIndex + 1
    }
  }

  return true
}

export default validate_class_code
