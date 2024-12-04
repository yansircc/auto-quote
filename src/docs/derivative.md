[Documentation](/developer/documentation) /

[Model Derivative API](/en/docs/model-derivative/v2) /

[Reference Guide](/en/docs/model-derivative/v2/reference)

Fetch Derivative Download URL

GET

# {urn}/​manifest/​{derivativeUrn}/​signedcookies

Returns a download URL and a set of signed cookies, which lets you securely download the derivative specified by the `derivativeUrn` URI parameter. The signed cookies have a lifetime of 6 hours. Although you cannot use range headers for this operation, you can use range headers with the returned download URL to download the derivative in chunks, in parallel.

See the Download OBJ file task of [Tutorial 1](/en/docs/model-derivative/v2/tutorials/translate-to-obj/task4-download-obj-file/) for a demonstration of how to download a derivative.

**Tip:** Before you use the download URL to download the derivative, you can call [Check Derivative Details](/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-HEAD) to determine its total content length. If the derivative is large, you can use range headers with the download URL to download the derivative in chunks, in parallel.

## [Resource Information](#resource-information)

| Method and URI         | GEThttps\://developer.api.autodesk.com/modelderivative/v2/designdata/{urn}/manifest/{derivativeUrn}/signedcookies            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Method and URI (EMEA)  | GEThttps\://developer.api.autodesk.com/modelderivative/v2/regions/eu/designdata/{urn}/manifest/{derivativeUrn}/signedcookies |
| Authentication Context | user context optional                                                                                                        |
| Required OAuth Scopes  | `data:read` _or_ `viewables:read`                                                                                            |
| Data Format            | JSON                                                                                                                         |

### Request

## [Headers](#headers)

| Authorization\*string | Must be `Bearer <token>`, where `<token>` is obtained via [POST /authentication/v2/token](/en/docs/oauth/v2/reference/http/gettoken-POST)                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| regionenum: string    | Specifies the data center where the specified manifest and derivative are stored in. Possible values are:- `US` : (Default) Data center for the US region.
- `EMEA` : Data center for the European Union, Middle East, and Africa regions.
- `AUS` : (Beta) Data centre for the Australia region.**Note:**- Beta features are subject to change. Please avoid using them in production environments.
- The Model Derivative service ignores this parameter if you use the EMEA URI for this operation. |

\* Required

### Request

## [URI Parameters](#uri-parameters)

| urnstring           | The URL safe Base64 encoded URN of the source design.                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| derivativeUrnstring | The URL-encoded URN of the derivative. Use [Fetch Manifest](/en/docs/model-derivative/v2/reference/http/urn-manifest-GET) to obtain this URN. |

## [Query String Parameters](#query-string-parameters)

| minutes-expirationinteger          | Specifies how many minutes the signed cookies should remain valid. Default is 360 minutes. The value you specify must be lower than the default for this parameter. If you specify a value greater than the default value, the Model Derivative service will return an error with an HTTP status code of 400. |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| response-content-dispositionstring | The value that must be returned with the download URL as the `response-content-disposition` query string parameter. Must begin with `attachment`. This value defaults to the default value corresponding to the derivative/file.                                                                              |

### Response

## [HTTP Status Code Summary](#http-status-code-summary)

| 200OK                     | Success.                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400BAD REQUEST            | Invalid request. For example, the input URN format is invalid or the value specified for the `minutes-expiration` query string parameter is invalid. |
| 401UNAUTHORIZED           | Invalid authorization header.                                                                                                                        |
| 403FORBIDDEN              | Access denied regardless of authorization status.                                                                                                    |
| 404NOT FOUND              | Endpoint does not exist.                                                                                                                             |
| 500INTERNAL SERVICE ERROR | Unexpected service interruption                                                                                                                      |

### Response

## [HTTP Headers](#http-headers)

| Content-Typestring         | `application/octet-stream`.                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Content-Lengthstring       | Denotes the size of the derivative, in bytes.                                                          |
| x-ads-app-identifierstring | The service identifier. Comprises of the service name, version, and environment.                       |
| x-ads-startup-timestring   | The service startup time with data format `EEE MMM dd HH:mm:ss Z yyyy`.                                |
| x-ads-durationstring       | The request duration in milliseconds.                                                                  |
| Set-Cookiestring           | Signed cookie to use with download URL. There will be three headers in the response named `Set-Cookie` |

### Response

## [Body Structure (200)](#body-structure-200)

| etagstring         | The calculated ETag hash of the derivative/file, if available.               |
| ------------------ | ---------------------------------------------------------------------------- |
| sizestring         | The size of the derivative/file, in bytes.                                   |
| urlstring          | The download URL.                                                            |
| content-typestring | The content type of the derivative/file.                                     |
| expirationstring   | The 13-digit epoch time stamp indicating the time the signed cookies expire. |

## [Example](#example)

This example shows the successful retrieval of a download URL and signed cookies.

### Request

```
curl -X 'GET' \
     -H 'Authorization: Bearer ztcaB2R0f92bsV6iV0bSDgwmSVaW...' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6anAtMjIwNTIwL2JveC5pcHQ/manifest/urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6anAtMjIwNTIwL2JveC5pcHQ/output/225ba6fd-8516-460d-bb34-8bc85c09a79d/box.obj/signedcookies'
```

__

### Response

```
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Type: application/json; charset=utf-8
Date: Thu, 26 May 2022 05:44:08 GMT
Set-Cookie: CloudFront-Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLmRlcml2YXRpdmUuYXV0b2Rlc2suY29tL2RYSnVPbUZrYzJzdWIySnFaV04wY3pwdmN5NXZZbXBsWTNRNmFuQXRNakl3TlRJd0wySnZlQzVwY0hRL291dHB1dC8yMjViYTZmZC04NTE2LTQ2MGQtYmIzNC04YmM4NWMwOWE3OWQvYm94Lm9iaiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY1MzU2NTQ0OH19fV19; Path=/; Domain=cdn.derivative.autodesk.com; HTTPOnly
Set-Cookie: CloudFront-Key-Pair-Id=APKAIJ4JBLIOQMJEURDQ; Path=/; Domain=cdn.derivative.autodesk.com; HTTPOnly
Set-Cookie: CloudFront-Signature=FP-wcYYIt07Qe4c2rEjvZtLNy3lCIkxrjmgWHrsWQB6KN8y-PV1~p0be85FmL2m-Y7vvg536xHBH7zfteyP-jOn6nlXamCwVWqjNj4fmCaz9pLkBCrA8kVz9rrRtKOafQCFacjEXstT4wwcjKYz0J7sKK7qyhyzUuxRhkby1OsLXp8q2be4t6zYNJ205exsA7cxjnGMl9XRhoGF13H7RA8bRdBoCZ6L~cJIJYyb~A1lvbaCG~c4FWnv1p27M22CMGm8HORX5uSN-Qcxs5MeyDVM-Zk6ku~pr4ZxMRo1Oy6dSpNax6rfeK0-BKnPJZSVaxZ2gu5EDzotDMFGd-gHaQg__; Path=/; Domain=cdn.derivative.autodesk.com; HTTPOnly
Strict-Transport-Security: max-age=31536000; includeSubDomains
Vary: Accept-Encoding
x-ads-app-identifier: platform-viewing-2022.05.01.75.c20538dec-production
x-ads-duration: 89 ms
```