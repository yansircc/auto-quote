[Documentation](/developer/documentation) /

[Model Derivative API](/en/docs/model-derivative/v2) /

[Reference Guide](/en/docs/model-derivative/v2/reference)

Fetch All Properties

GET

# {urn}/​metadata/​{modelGuid}/​properties

Returns a list of properties of all objects in the Model View specified by the `modelGuid` URI parameter.

This operation returns properties of all objects by default. However, you can restrict the results to a specific object by specifying its ID as the `objectid` query string parameter.

Properties are returned as a flat list, ordered, by their `objectid`. The `objectid` is a non-persistent ID assigned to an object when the source design is translated to the SVF or SVF2 format. This means that:

- A design file must be translated to SVF or SVF2 before you can retrieve properties.
- The `objectid` of an object can change if the design is translated to SVF or SVF2 again. If you require a persistent ID across translations, use `externalId` to reference objects, instead of `objectid`.

Before you call this operation:

- Use the [List Model Views](/en/docs/model-derivative/v2/reference/http/urn-metadata-GET/) operation to obtain the list of Model Views (Viewables) in the source design.
- Pick the ID of the Model View you want to query and specify that ID as the value for the `modelGuid` URI parameter.

**Tip**: Use [Fetch Specific Properties](/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET/) to retrieve only the objects and properties of interest. What’s more, the response is paginated. So, when the number of properties returned is large, responses start arriving more promptly.

## [Resource Information](#resource-information)

| Method and URI         | GEThttps\://developer.api.autodesk.com/modelderivative/v2/designdata/{urn}/metadata/{modelGuid}/properties                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method and URI (EMEA)  | GEThttps\://developer.api.autodesk.com/modelderivative/v2/regions/eu/designdata/{urn}/metadata/{modelGuid}/properties                                                                                                     |
| Authentication Context | user context optional                                                                                                                                                                                                     |
| Required OAuth Scopes  | `data:read`                                                                                                                                                                                                               |
| Data Format            | JSON                                                                                                                                                                                                                      |
| Rate Limit             | 60 calls per minute for force getting large resource.300 calls per minute for requests that trigger metadata extraction. Does not apply to requests querying models whose metadata extraction is complete or in progress. |

### Request

## [Headers](#headers)

| Authorization\*string | Must be `Bearer <token>`, where `<token>` is obtained using [POST /authentication/v2/token](/en/docs/oauth/v2/reference/http/gettoken-POST)                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accept-Encodingstring | A comma separated list of the algorithms you want the response to be encoded in, specified in the order of preference.If you specify `gzip` or `*`, content is compressed and returned in gzip format. |
| regionenum: string    | Specifies the data center where the manifest and derivative of the specified source design are stored in. Possible values are:- `US` : (Default) Data center for the US region.                        |

- `EMEA` : Data center for the European Union, Middle East, and Africa regions.
- `AUS` : (Beta) Data centre for the Australia region.**Note:**- Beta features are subject to change. Please avoid using them in production environments.
- The Model Derivative service ignores this parameter if you use the EMEA URI for this operation. |
  | x-ads-forcebool | \* `true`: Forces the system to parse property data all over again. Use this option to retrieve an object tree when previous attempts have failed.

* `false`: (Default): Use previously parsed property data to extract the object tree. |
  | x-ads-derivative-formatenum:string | Specifies what type of Object IDs to return, if the design has legacy SVF derivatives generated by the BIM Docs service. Possible values are:\* `latest` - (Default) Return SVF2 Object IDs.
* `fallback` - Return SVF Object IDs.**Note**1) This parameter applies only to designs with legacy SVF derivatives generated by the BIM 360 Docs service.

2. The BIM 360 Docs service now generates SVF2 derivatives. SVF2 Object IDs may not be compatible with the SVF Object IDs previously generated by the BIM 360 Docs service. Setting this header to `fallback` may resolve backward compatibility issues resulting from Object IDs of legacy SVF derivatives being retained on the client side.

3. If you use this header with one derivative (URN), you must use it consistently across the following operations for that derivative.

   - [Create Translation Job](/en/docs/model-derivative/v2/reference/http/job-POST) (for OBJ output)
   - [Fetch Object Tree](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-GET/)
   - [Fetch All Properties](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-properties-GET/)
   - [Fetch Specific Properties](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-properties-query-POST/) |

\* Required

### Request

## [URI Parameters](#uri-parameters)

| urnstring       | The URL safe Base64 encoded URN of the source design.                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| modelGuidstring | The ID of the Model View (Viewable) that contains the objects you want to fetch properties for. |

### Request

## [Query String Parameters](#query-string-parameters)

| objectidlong   | The Object ID of the object you want to restrict the response to. If you do not specify this parameter, all properties of all objects within the Model View are returned.                                                                                                                                                                                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| forcegetstring | `true`: Retrieves large resources, even beyond the 20 MB limit. If exceptionally large (over 800 MB), the system acts as if `forceget` is `false`. In this case, use the `objectid` query string parameter to download resources one object at a time. Alternatively, you can use [Fetch Specific Properties](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-properties-query-POST/) to fetch specific properties.`false`: (Default) Does not retrieve resources if they are larger than 20 MB. |

### Response

## [HTTP Status Code Summary](#http-status-code-summary)

| 200OK                       | Success.                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 202ACCEPTED                 | Request accepted but processing not complete. Call this endpoint again, until getting 200 OK.                                                                            |
| 400BAD REQUEST              | Invalid request.                                                                                                                                                         |
| 401UNAUTHORIZED             | Invalid authorization header.                                                                                                                                            |
| 403FORBIDDEN                | Access denied regardless of authorization status.                                                                                                                        |
| 404NOT FOUND                | Endpoint does not exist or failed to extract the content.                                                                                                                |
| 406NOT ACCEPTABLE           | The request is not supported. For example, when you have attempted to query a property larger than the allowable limit; 800 MB.                                          |
| 409CONFLICT                 | The request conflicts with a previous request that is still in progress.                                                                                                 |
| 413REQUEST ENTITY TOO LARGE | The resource exceeded the expected maximum size (20 MB).                                                                                                                 |
| 429TOO MANY REQUEST         | Rate limit exceeded (60 requests per minute for force getting or 300 requests per minute for requests that trigger metadata extraction). Wait some time before retrying. |
| 500INTERNAL SERVICE ERROR   | Unexpected service interruption.                                                                                                                                         |

### Response

## [HTTP Headers](#http-headers)

| x-ads-app-identifierstring  | The service identifier. Comprised of the service name, version, and environment.              |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| x-ads-startup-timestring    | The service startup time specified in the `EEE MMM dd HH:mm:ss Z yyyy` format.                |
| x-ads-durationstring        | The request duration in milliseconds.                                                         |
| x-ads-troubleshootingstring | Provides information to assist troubleshooting in the evnt of a server failure.               |
| x-ads-sizestring            | Size of the requested data in bytes. This header is returned for the 413 HTTP status as well. |

### Response

## [Body Structure (200)](#body-structure-200)

\_\_Expand all

| \_\_dataobject                                                             | An envelope that encapsulates the return data.                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_\_typestring                                                             | The type of data that is returned. Always `properties`.                                                                                                                                                                                              |
| \_\_collectionarray                                                        | A non-hierarchical list of objects contained in the specified Model View. Each object has a `properties` attribute, which contains the properties of that object.                                                                                    |
| \_\_objectidnumber                                                         | Unique identifier of the object.**Note:** The `objectid` is a non-persistent ID assigned to an object when a design file is translated to SVF or SVF2. So:- The `objectid` of an object can change if the design is translated to SVF or SVF2 again. |
| - If you require a persistent ID to reference an object, use `externalId`. |
| \_\_namestring                                                             | Name of the object.                                                                                                                                                                                                                                  |
| \_\_externalIdstring                                                       | A unique identifier of the object as defined in the source design. For example, `UniqueID` in Revit files.                                                                                                                                           |
| \_\_propertiesobject                                                       | A JSON object containing dictionary objects (key value pairs), where the key is the property name and the value is the value of the property.                                                                                                        |

### Response

## [Body Structure (202)](#body-structure-202)

| resultstring | A message to indicate that the request was accepted but processing is not complete. |
| ------------ | ----------------------------------------------------------------------------------- |

## [Example 1](#example-1)

This example demonstrates the successful retrieval of all properties of all objects (200). This example uses an Inventor model translated to SVF.

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...'  \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/4f981e94-8241-4eaf-b08b-cd337c6b8b1f/properties'
```

\_\_

### Response

```
Status Code: 200 OK
Last-Modified: Fri. 13 May 2016 08:49:06 GMT
x-ads-app-identifier=platform-viewing-2016.05.03.1102.2f6bfbf-production
x-ads-startup-time: Fri May 13 08:49:06 UTC 2016
x-ads-duration: 3 ms
{
  "data": {
    "type": "properties",
    "collection": [
      {
        "objectid": 1,
        "name": "A5",
        "externalId": "mou0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Name": "A5"
        }
      },
      {
        "objectid": 2,
        "name": "Model",
        "externalId": "z4u0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Component Name": "Model",
          "Name": "Model",
          "Design Tracking Properties": {
            "Design State": "WorkInProgress",
            "Designer": "ADSK",
            "File Subtype": "Assembly"
          },
          "File Properties": {
            "Author": "ADSK",
            "Creation Date": "2012-Jul-09 20:18:20",
            "Original System": "Autodesk Inventor 2017",
            "Part Number": "Model"
          },
          "Mass Properties": {
            "Area": "19772.676 millimeter^2",
            "Volume": "83673.946 millimeter^3"
          }
        }
      },
      {
        "objectid": 3,
        "name": "Bottom",
        "externalId": "0Yu0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Component Name": "A5-P1",
          "Name": "Bottom",
          "Design Tracking Properties": {
            "Design State": "WorkInProgress",
            "Designer": "ADSK",
            "File Subtype": "Modeling"
          },
          "File Properties": {
            "Author": "ADSK",
            "Creation Date": "2012-Jul-09 20:18:35",
            "Original System": "Autodesk Inventor 2017",
            "Part Number": "Bottom"
          },
          "Mass Properties": {
            "Area": "7000 millimeter^2",
            "Volume": "25000 millimeter^3"
          }
        }
      },
      {
        "objectid": 4,
        "name": "Box",
        "externalId": "1Iu0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Center of Gravity:": "-13.452 mm, -9.879 mm, -40.735 mm",
          "Name": "Box"
        }
      },
      {
        "objectid": 5,
        "name": "Pillar",
        "externalId": "1ou0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Component Name": "Pillar",
          "Name": "Pillar",
          "Design Tracking Properties": {
            "Design State": "WorkInProgress",
            "Designer": "ADSK",
            "File Subtype": "Modeling"
          },
          "File Properties": {
            "Author": "ADSK",
            "Creation Date": "2012-Jul-09 20:18:35",
            "Original System": "Autodesk Inventor 2017",
            "Part Number": "Pillar"
          },
          "Mass Properties": {
            "Area": "7000 millimeter^2",
            "Volume": "25000 millimeter^3"
          }
        }
      },
      {
        "objectid": 6,
        "name": "Cylinder",
        "externalId": "2Iu0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Mass:": "0.012 gram",
          "Name": "Cylinder"
        }
      },
      {
        "objectid": 7,
        "name": "Top",
        "externalId": "2ou0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Component Name": "Top",
          "Name": "Top",
          "Design Tracking Properties": {
            "Design State": "WorkInProgress",
            "Designer": "ADSK",
            "File Subtype": "Modeling"
          },
          "File Properties": {
            "Author": "ADSK",
            "Creation Date": "2012-Jul-09 20:19:38",
            "Original System": "Autodesk Inventor 2017",
            "Part Number": "Top"
          },
          "Mass Properties": {
            "Area": "5772.676 millimeter^2",
            "Volume": "33673.946 millimeter^3"
          }
        }
      },
      {
        "objectid": 8,
        "name": "Box",
        "externalId": "3Iu0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Material": "ABS Plastic",
          "Name": "Box"
        }
      }
    ]
  }
}
```

Show More

\_\_

## [Example 2](#example-2)

This example is the same as Example 1, but filtered to display all properties of the object with an `objectid` of `7` (200).

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...'  \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/4f981e94-8241-4eaf-b08b-cd337c6b8b1f/properties?objectid=7'
```

\_\_

### Response

```
HTTP/1.1 200 OK
x-ads-app-identifier: platform-viewing-2022.06.01.100.3f9faaead-production
x-ads-duration: 193 ms
x-ads-startup-time: Mon Jun 27 01:13:34 UTC 2022
{
  "data": {
    "type": "properties",
    "collection": [
      {
        "objectid": 7,
        "name": "Top",
        "externalId": "2ou0zG8ViUOsqUzhb4TUiA",
        "properties": {
          "Component Name": "Top",
          "Name": "Top",
          "Design Tracking Properties": {
            "Design State": "WorkInProgress",
            "Designer": "ADSK",
            "File Subtype": "Modeling"
          },
          "File Properties": {
            "Author": "ADSK",
            "Creation Date": "2012-Jul-09 20:19:38",
            "Original System": "Autodesk Inventor 2017",
            "Part Number": "Top"
          },
          "Mass Properties": {
            "Area": "5772.676 millimeter^2",
            "Volume": "33673.946 millimeter^3"
          }
        }
      }
    ]
  }
}
```

Show More

\_\_

## [Example 3](#example-3)

This example demonstrates the successful submission but the result is pending (202).

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/4f981e94-8241-4eaf-b08b-cd337c6b8b1f/properties'
```

\_\_

### Response

```
Status Code: 202 ACCEPTED
Last-Modified: Fri. 13 May 2016 08:49:06 GMT
x-ads-app-identifier=platform-viewing-2016.05.03.1102.2f6bfbf-production
x-ads-startup-time: Fri May 13 08:49:06 UTC 2016
x-ads-duration: 3 ms
{
  "result": "success"
}
```

Show More

\_\_

## [Example 4](#example-4)

Failed Attempt to Retrieve Large Properties (413)

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/c213b30e-73be-4060-ad9d-06f043192d9f/properties'
```

\_\_

### Response

```
Status Code: 413 Request Entity Too Large
date: Fri, 03 Aug 2018 08:17:33 GMT
x-ads-app-identifier=platform-viewing-2018.06.02.63.f1ad853-production
x-ads-startup-time: Fri Aug 03 05:34:31 UTC 2018
x-ads-duration: 126 ms
x-ads-size: 529625314
{
  "diagnostic": "Please use the 'forceget' parameter to force querying the data."
}
```

Show More

\_\_

## [Example 5](#example-5)

This example demonstrates the successful retrieval of large properties with the `forceget` option (200).

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/c213b30e-73be-4060-ad9d-06f043192d9f/properties?forceget=true'
```

\_\_

### Response

```
Status Code: 200 OK
date: Fri, 03 Aug 2018 08:13:04 GMT
x-ads-app-identifier=platform-viewing-2018.06.02.63.f1ad853-production
x-ads-startup-time: Fri Aug 03 05:34:31 UTC 2018
x-ads-duration: 1973 ms
x-ads-size: 529625314
{
  "data": {
      "type": "properties",
      "collection": [
          ...
      ]
  }
}
```

Show More

\_\_

## [Example 6](#example-6)

This example demonstrates a failed attempt to retrieve properties or an attempt that timed out(404).

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/c213b30e-73be-4060-ad9d-06f043192d9f/properties'
```

\_\_

### Response

```
Status Code: 404 Not Found
date: Fri, 03 Aug 2018 08:13:04 GMT
x-ads-app-identifier=platform-viewing-2018.06.02.63.f1ad853-production
x-ads-startup-time: Fri Aug 03 05:34:31 UTC 2018
x-ads-duration: 81 ms
x-ads-size: 26825314
{
  "diagnostic": "Failed to query the data."
}
```

Show More

\_\_

## [Example 7](#example-7)

This example demonstrates the successful retrieval of properties using the x-ads-force option to retry on recoverable failures (200).

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -H 'x-ads-force: true' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA/metadata/c213b30e-73be-4060-ad9d-06f043192d9f/properties'
```

\_\_

### Response
