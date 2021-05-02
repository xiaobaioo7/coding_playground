# Function to validate class code

A single function to validate a given code. It validates the code against a list of distracting words as well as a list of existing codes. The code is valid only when all of the following criterias are met:

- when the code does not already exist
- when the code does not contain any of the distracting word in consecutive or non-consecutive order. For example, codes like `RATS42` and `R4A2TS` are considered invalid when one of the distracting words is `rats`

## Function signature

Inputs: 
- code (string)
- distracting_words (string array)
- existing_codes (string array)

Output:
- is_valid (boolean)

## Unit tests

You can run the following command to run all the unit tests for the function:

```
npm run test
```

## Notes

Some logic in the function is based on a few assumptions, considering some refactor and improvements with further clarifications. These assumptions are:

- code must be alphanumeric and 6 character long
- any validation against the distracting words or existing codes is case insensitive
- for performance, there are no duplicates in list of distracting words
