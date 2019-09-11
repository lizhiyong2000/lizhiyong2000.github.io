


```
db.getCollection('playitems').find({$and:[{thumb_resolution:{$exists:true}}, { $where: 'this.thumb_resolution.length > 0' }]}).count()

```


```
db.getCollection('playitems').distinct("thumb_resolution").sort()
```



```
db.getCollection('playitems').find({$and:[{thumb_resolution:{$exists:false}}, { $where: 'this.thumb.length > 0' }]}).count()
```
