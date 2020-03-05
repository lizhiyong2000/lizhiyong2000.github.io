## Index Management

### 1 close index
    POST /etc-sh-index/_close                                    

### 2. update index default analyzer  
    PUT /etc-sh-index/_settings
    {
                "analysis": {
                    "analyzer": {
                       "default":{
                          "type":"ik_max_word"
                       }
                    }
                }
      
     
    }

    PUT /etc-sh-index/_settings
    {
        "analysis": {
            "analyzer": {
               "search_analyzer":{
                  "type":"ik_max_word"
               }
            }
        }
      
     
    }

### 3. re-open index
    POST /etc-sh-index/_open


### 4. change index settings - shards
    PUT _template/all
    {
      "template": "*",
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 1
      }
    }



## Query
>Analyze text by a specific analyzer

    GET /_analyze
    {
      "analyzer": "ik_max_word", 
      "text": ["四川"]
      
    }

## Aggreation
>Problem: Fielddata is disabled on text fields by default. Set fielddata=true

    PUT gas-station-index/_mapping/gas-station/
    {
      "properties": {
        "province": { 
          "type":     "text",
          "fielddata": true
        }
      }
    }