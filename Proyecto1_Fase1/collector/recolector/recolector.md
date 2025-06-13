endopoints del recolector:

```
{
    "endpoints":
        {
        "health":"/health",
        "info":"/info",
        "metrics":"/metrics"
        },
    "message":" Recolector de Métricas del Sistema",
    "status":"running"
}
```

/metric:

```
{
    "timeStamp":"2025-06-12T17:43:08-06:00",
    "ram":
        {
            "total":7.66,
            "libre":0.82,
            "uso":6.84,
            "porcentaje":89.29,
            "compartida":0.15,
            "buffer":0.03
        },
    "cpu":
        {
            "carga_avg":
                {
                    "1min":1.07,
                    "5min":1.16,
                    "15min":1.12
                },
            "frecuencia":
                {
                    "actual_mhz":1200
                },
            "uso":
                {
                    "cpu_used":8.51,
                    "cpu_free":91.49
                },
            "porcesos":
                {
                    "ejecutando":0,
                    "bloqueados":0
                }
        },
    "status":"success",
    "message":"Lectura de datos correcta"
}
```

/info:
```
{"description":"Servicio que lee módulos del kernel y recolecta métricas de CPU y RAM","endpoints":{"/health":"GET - Verifica el estado del servicio","/info":"GET - Información sobre el servicio","/metrics":"GET - Obtiene métricas actuales del sistema"},"service":"Recolector de Métricas del Sistema","technology":{"features":["Goroutines","Channels","Concurrent File Reading"],"framework":"Gin","language":"Go"},"timestamp":"2025-06-12T17:43:52-06:00"}
```

/health
```
{"service":"recolector-monitoreo","status":"healthy","timestamp":"2025-06-12T17:44:40-06:00","version":"1.0.0"}
```