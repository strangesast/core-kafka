# Mongo Aggregations

## Difference between part count changes
```
db.getCollection('input').aggregate([
  {$addFields: {timestamp: {$dateFromString: {dateString: '$timestamp'}}}},
  {$addFields: {values: {$cond: {
      if: {$eq: [{$arrayElemAt: ['$values', 0]}, 'message']},
      then: ['message', {$arrayElemAt: ['$values', 2]}],
      else: '$values'
  }}}},
  {$addFields: {values: {$map: {
      input: {$range: [0, {$size: '$values'}, 2]},
      in: {$slice: ['$values', '$$this', 2]},
  }}}},
  {$addFields: {values: {$filter: {
      input: '$values',
      cond: {$ne: [{$arrayElemAt: ['$$this', 0]}, ""]},
  }}}},
  {$addFields: {values: {$arrayToObject: '$values'}}},
  {$addFields: {'values.timestamp': '$timestamp'}},
  {$replaceRoot: {'newRoot': '$values'}},
  {$match: {$expr: {$ne: ['$part_count', undefined]}}},
  {$group: {'_id': null, 'values': {$push: {count: '$part_count', timestamp: '$timestamp'}}}},
  {$addFields: {values: {
      $reduce: {
          input: '$values',
          initialValue: [],
          in: {$cond: {
              if: {$gt: [{$size: '$$value'}, 0]},
              then: {$concatArrays: ['$$value',  [{$let: {
                      vars: {
                          val: {$arrayElemAt: ['$$value', {$subtract: [{$size: '$$value'}, 1]}]}
                      },
                      in: {timestamp: '$$this.timestamp', diff: {$subtract: ['$$this.timestamp', '$$val.timestamp']}}
                  }}]]
              },
              else: [{timestamp: '$$this.timestamp', diff: 0}],
          }},
      }
  }}},
  {$unwind: '$values'},
  {$replaceRoot: {newRoot: '$values'}},
  {$addFields: {diff: {$divide: ['$diff', 1000*60]}}},
])
```

## Key occurance count
```
db.getCollection('input').aggregate([
  {$addFields: {timestamp: {$dateFromString: {dateString: '$timestamp'}}}},
  {$addFields: {values: {$cond: {
      if: {$eq: [{$arrayElemAt: ['$values', 0]}, 'message']},
      then: ['message', {$arrayElemAt: ['$values', 2]}],
      else: '$values'
  }}}},
  {$addFields: {values: {$map: {
      input: {$range: [0, {$size: '$values'}, 2]},
      in: {$slice: ['$values', '$$this', 2]},
  }}}},
  {$addFields: {values: {$filter: {
      input: '$values',
      cond: {$ne: [{$arrayElemAt: ['$$this', 0]}, ""]},
  }}}},
  {$addFields: {values: {$arrayToObject: '$values'}}},
  {$addFields: {'values.timestamp': '$timestamp'}},
  {$replaceRoot: {'newRoot': '$values'}},
  {$project: {'values': {$objectToArray: '$$ROOT'}}},
  {$unwind: '$values'},
  {$replaceRoot: {newRoot: '$values'}},
  {$group: {_id: '$k', count: {$sum: 1}}},
  {$sort: {count: -1}},
  //{$group: {_id: null, modes: {$addToSet: '$mode'}}},
])
```

## Execution states
```
  "ACTIVE",
  "INTERRUPTED",
  "READY",
  "STOPPED"
```
