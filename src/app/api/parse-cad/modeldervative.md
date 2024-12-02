[Documentation](/developer/documentation) /

[Model Derivative API](/en/docs/model-derivative/v2) /

[How-to Guide](/en/docs/model-derivative/v2/tutorials)

# Task 1 – Obtain an Access Token

This task produces a two-legged token with a scope sufficient to authenticate the remaining tasks in this walkthrough.

By the end of this task, you will know how to obtain a two-legged access token when the Client ID and Client Secret is known.

You use the following operation for this task:

| Operation                                                              | HTTP Request |
| ---------------------------------------------------------------------- | ------------ |
| [Get an Access Token](/en/docs/oauth/v2/reference/http/gettoken-POST/) | POST /token  |

## [Step 1 - Register an App](#step-1-register-an-app)

Follow the instructions in the walkthrough [Create an app](/en/docs/oauth/v2/tutorials/create-app) to register an app for this walkthrough. Note down the Client ID and Client Secret you recieve for the app. When specifying details of the app, make sure that the “Model Derivative API” and “Data Management API” are selected.

## [Step 2: Encode your Client ID and Client Secret](#step-2-encode-your-client-id-and-client-secret)

Before you request an access token, you must encode your Client ID and Client Secret to ensure the integrity of the data you send. To do this, first, concatenate your Client ID with your Client Secret using the colon character as a separator. After that, convert the concatenated string to a Base64 encoded string.

1. Concatenate your Client ID and Client Secret with a colon character (:) in between, as shown below.

   ```
   <CLIENT_ID>:<CLIENT_SECRET>
   ```

   \_\_

2. Use the appropriate function or method in your preferred programming language to encode the combined string to the Base64 format. Examples:

   | Programming Language | Method/Function                                 |
   | -------------------- | ----------------------------------------------- |
   | JavaScript           | `btoa()` function                               |
   | Python               | `b64encode()` function from the `base64` module |
   | C#                   | `Convert.ToBase64String()` method               |

   \[x] JavaScript

   ```
   const clientId =  "<CLIENT_ID>";
   const clientSecret =  "<CLIENT_SECRET>";
   const clientAuthKeys =  btoa(clientId +":"+clientSecret);
   ```

   \_\_

   \[ ] Python

   ```
   import base64

   clientId = "<CLIENT_ID>"
   clientSecret = "<CLIENT_SECRET>"
   clientAuthKeys = base64.b64encode((clientId + ":" + clientSecret).encode("ascii")).decode("ascii")
   ```

   \_\_

   \[ ] C#

   ```
   using System;
   using System.Text;

   string clientId = "<CLIENT_ID>";
   string clientSecret = "<CLIENT_SECRET>";
   string combinedKeys = clientId + ":" + clientSecret;
   byte[] bytesToEncode = Encoding.UTF8.GetBytes(combinedKeys);
   string encodedText = Convert.ToBase64String(bytesToEncode);
   ```

   Show More

   \_\_

   **Note:** There are online tools that you can use to convert the combined string to a Base64 encoded string. However, we don’t recommend that you use such tools. Exposing your Client ID and Client Secret to an online tool can pose a security threat.

   You should receive a string that looks like `RjZEbjh5cGVtMWo4UDZzVXo4SVgzcG1Tc09BOTlHVVQ6QVNOa3c4S3F6MXQwV1hISw==`.

## [Step 3: Use encoded string to obtain an Access Token](#step-3-use-encoded-string-to-obtain-an-access-token)

Call the [POST token](/en/docs/oauth/v2/reference/http/gettoken-POST) endpoint:

The Base64 encoded Client ID + Client Secret are passed through the `Authorization` header. The `grant_type` and `scope` are specified as form fields in the request body.

```
curl -v 'https://developer.api.autodesk.com/authentication/v2/token' \
   -X 'POST' \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -H 'Accept: application/json' \
   -H 'Authorization: Basic <BASE64_ENCODED_STRING_FROM_STEP_2>' \
   -d 'grant_type=client_credentials' \
   -d 'scope=data:write data:read bucket:create bucket:delete'
```

\_\_

A successful response, will look like the following:

```
HTTP/1.1 200 OK
Cache-Control: no-cache, no-store, no-store
Content-Type: application/json;charset=UTF-8
Date: Mon, 20 Feb 2017 04:46:41 GMT
Expires: Thu, 01 Jan 1970 00:00:00 GMT
max-age: Thu, 01 Jan 1970 00:00:00 GMT
Pragma: no-cache
Server: Apigee Router
Set-Cookie: PF=2xeh6LTdKKqibsTu9HlyM5;Path=/;Secure;HttpOnly
X-Frame-Options: SAMEORIGIN
Content-Length: 436
Connection: keep-alive

{
  "token_type": "Bearer",
  "expires_in": 1799,
  "access_token": "<YOUR_ACCESS_TOKEN>"
}
```

Show More

\_\_

**Notes:**

- Copy the access token (indicated by `<YOUR_ACCESS_TOKEN>` in the preceding example) in the response. You use this value for all subsequent requests in this walkthrough.
- The access token expires in the number of seconds specified by the `expires_in` attribute.
- Although the scope specified in the request is `data:write data:read bucket:create bucket:delete`, Model Derivative requires only the scopes `data:write` and `data:read`. The scopes `bucket:create bucket:delete` are for HTTP requests to the Data Management API.

# Task 2 – Upload Source File to OSS

The Object Storage Service (OSS) is a generic Cloud Storage Service that is part of the Data Management API. In this task, you upload a Revit model to OSS. While you can use any model, for this walkthrough we recommend that you use the Revit model we provide ( _rac_basic_sample_project.rvt_ ). You can get this file from the _walkthrough_data_ folder of the GitHub repository containing the Postman Collection for this walkthrough.

By the end of this task you will be able to:

- Create a Bucket to store the files.
- Obtain a signed URL to upload a file to the bucket.
- Upload a file to the Bucket.
- Obtain the URN of the uploaded file.
- Convert the URN to a Base64-encoded URN.

You will use the following operations in this task:

| Operation                                                                                                                     | HTTP Request                                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Create a Bucket](/en/docs/data/v2/reference/http/buckets-POST/)                                                              | POST /buckets                                                |
| [Get a Signed URL to Upload a File](/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectKey-signeds3upload-GET) | GET /buckets/{bucketKey}/objects/{objectKey}/signeds3upload  |
| [Finalize File Upload](/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectKey-signeds3upload-POST)             | POST /buckets/{bucketKey}/objects/{objectKey}/signeds3upload |

## [Step 1 - Create a Bucket](#step-1-create-a-bucket)

The first thing to do is create a Bucket to hold the Revit model. Once a Bucket is created, you can store files in it as Objects.

### Request

```
curl -X POST \
    'https://developer.api.autodesk.com/oss/v2/buckets' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json' \
    -H 'x-ads-region: US' \
    -d '{
        "bucketKey": "<YOUR_BUCKET_KEY>",
        "access": "full",
        "policyKey": "transient"
        }'
```

Show More

\_\_

**Notes:**

- You must specify a name for your Bucket. Replace `<YOUR_BUCKET_KEY>` with the name for the Bucket.
- Bucket keys can only be made up of lower case characters, numbers 0-9, and the underscore (\_) character.
- The Bucket key must be unique throughout all of the OSS service. If the Bucket key is already in use (even by another user) the server returns a `409 Conflict` error. In such a case, retry with another Bucket name.

### Response

```
{
    "bucketKey": "<YOUR_BUCKET_KEY>",
    "bucketOwner": "<YOUR_CLIENT_ID>",
    "createdDate": 1571296694595,
    "permissions": [
        {
            "authId": "T05H372IE11Kmkksdh73ndj0qie2f6nib",
            "access": "full"
        }
    ],
    "policyKey": "transient"
}
```

Show More

\_\_

## [Step 2 - Obtain signed URL](#step-2-obtain-signed-url)

To upload a file to an OSS bucket, you need to have a signed upload URL. To obtain a signed URL:

### Request

```
curl -X GET \
    'https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>/signeds3upload?minutesExpiration=<LIFESPAN_OF_URL>' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json'
```

\_\_

**Notes:**

- Replace \<YOUR_ACCESS_TOKEN> with the access token you obtained in Task 1.
- Replace \<LIFESPAN_OF_URL> with 10. This will ensure that the signed URL that is returned will be valid for 10 minutes.
- Replace \<YOUR_OBJECT_KEY> with _rac_basic_sample_project.rvt_, which is the name of the file we recommend that you upload.

### Response

```
  {
      "uploadKey": "<YOUR_UPLOAD_KEY>",
      "uploadExpiration": "2022-04-08T00:00:00Z",
      "urlExpiration": "2022-04-06T17:59:46Z",
      "urls": ["<SIGNED_UPLOAD_URL>"],
      "location": "https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>"
  }
```

\_\_

Note down the values returned for `uploadKey` \<YOUR_UPLOAD_KEY> and `urls` \<SIGNED_UPLOAD_URL>. You will use these values in subsequent requests.

## [Step 3 - Upload the file](#step-3-upload-the-file)

1. Download the file _rac_basic_sample_project.rvt_ from <https://github.com/autodesk-platform-services/aps-tutorial-postman/tree/master/ModelDerivative_05/walkthrough_data>.
2. Send a request to upload the file to the Bucket.

### Request

```
curl -X PUT \
    '<SIGNED_UPLOAD_URL>'\
    --data-binary '@<PATH_TO_YOUR_FILE_TO_UPLOAD>'
```

\_\_

## [Step 4 - Finalize Upload](#step-4-finalize-upload)

To make the uploaded file available for download, you must finalize the upload. To complete the upload:

### Request

```
curl -X POST \
    'https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>/signeds3upload' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json' \
    -d '{
        "ossbucketKey": "<YOUR_BUCKET_KEY>",
        "ossSourceFileObjectKey": "<YOUR_OBJECT_KEY>",
        "access": "full",
        "uploadKey": "<YOUR_UPLOAD_KEY>"
        }'
```

Show More

\_\_

### Response

```
{
    "bucketKey": "<YOUR_BUCKET_KEY>",
    "objectId": "<YOUR_OBJECT_ID>",
    "objectKey": "<YOUR_OBJECT_KEY>",
    "size": "17813504",
    "contentType": "application/octet-stream",
    "location": "https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<OBJECT_KEY_4_REVIT_FILE>",
    "permissions": [
        {
            "authId": "<YOUR_ACCESS_TOKEN>",
            "access": "full"
        }
    ],
    "policyKey": "transient"
}
```

Show More

\_\_

## [Step 3 - Convert the Revit File URN to a Base64-encoded URN](#step-3-convert-the-revit-file-urn-to-a-base64-encoded-urn)

Most Model Derivative requests require the URN of the source file to be a Base64-encoded URN.

- Use [this online tool](http://www.freeformatter.com/base64-encoder.html) to convert the URN of the source file (The value of `objectId` you obtained in the previous step).

For further information, see the full list of [Base64 variants](https://en.wikipedia.org/wiki/Base64#Variants_summary_table).

We recommend using the unpadded option (RFC 6920), since it uses URL-safe characters. The following example shows a URN, its Base64-encoded form, and its URL safe Base64-encoded form:

| raw                          | `urn:adsk.objects:os.object:md_tute_01/Tuner.zip`                  |
| ---------------------------- | ------------------------------------------------------------------ |
| Base64                       | `dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bWRfdHV0ZV8wMS9UdW5lci56aXA=` |
| URL-safe Base64 (no padding) | `dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bWRfdHV0ZV8wMS9UdW5lci56aXA`  |

# Task 3 – Translate to SVF2

For the server to extract metadata from a model, you must first translate the model to a viewer-friendly format. Because SVF2 handles larger models better, Autodesk recommends SVF2 over SVF.

By the end of this task you will be able to:

- Start a translation job.
- Check the status of a translation job

You will use the following operations in this task:

| Operation                                                                       | HTTP Request        |
| ------------------------------------------------------------------------------- | ------------------- |
| [Start Translation Job](/en/docs/model-derivative/v2/reference/http/job-POST/)  | POST /job           |
| [Fetch Manifest](/en/docs/model-derivative/v2/reference/http/urn-manifest-GET/) | GET /{urn}/manifest |

## [Step 1 - Start a translation job](#step-1-start-a-translation-job)

When you start a translation job, you specify the Base64-encoded URN of the source file, as well of the translated file format you require, which is SVF2 in this case. You can optionally specify the region the translation must be stored.

### Request

```
curl  -X POST \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/job' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
      -H 'x-ads-force: true' \
      -d '{
          "input": {
              "urn": "<BASE64_ENCODED_URN_OF_SOURCE_FILE>"
          },
          "output": {
              "formats": [
                  {
                      "type": "svf2",
                      "views": [
                          "2d",
                          "3d"
                      ]
                  }
              ]
          }
      }'
```

Show More

\_\_

### Response

```
{
    "result": "success",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA",
    "acceptedJobs": {
        "output": {
            "formats": [
                {
                    "type": "svf2",
                    "views": [
                        "2d",
                        "3d"
                    ]
                }
            ]
        }
    }
}
```

Show More

\_\_

Note down the value of `urn`. This is the URL safe Base64-encoded URN of the source file. It is this URN you use to check the status of the translation job.

## [Step 2 - Check the Status of the translation job](#step-2-check-the-status-of-the-translation-job)

There are two ways to check the status of a translation job. The first is to set up a webhook that notifies you when the jib is done. The second is to poll the status of the job periodically. For this walkthrough, you will be polling the status of the translation job. This means that you must periodically inspect the manifest produced by the translation job. The `status` attribute in the manifest reports the status of the translation job. The status can be:

- `pending`: The job has been received and is pending for processing.
- `inprogress`: The job has started processing, and is running.
- `success`: The job has finished successfully.
- `failed`: The translation has failed.
- `timeout`: The translation has timed out and no output is generated.

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/manifest' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

# Task 4 – Extract Metadata

In order to extract metadata, you must wait until the translation job is done. There are two ways by which you can do this:

1. Periodically download the manifest and check if its `status` is `complete`.
2. Set up a webhook to notify you when the job is done.

## [Expected task outcome](#expected-task-outcome)

By the end of this task you will be able to:

- Get a list of Viewables contained within a model.
- Use the metadata GUID of the Viewable to retrieve the properties of objects in the Viewable.

You will use the following operations in this task:

| Operation                                                                                                         | HTTP Request                                      |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Fetch Manifest](/en/docs/model-derivative/v2/reference/http/urn-manifest-GET/)                                   | GET /{urn}/manifest                               |
| [List Model Views](/en/docs/model-derivative/v2/reference/http/urn-metadata-GET/)                                 | GET /{urn}/metadata                               |
| [Fetch Object Tree](/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET/)                           | GET /{urn}/metadata/{modelGuid}                   |
| [Fetch All Properties](/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET/)             | GET /{urn}/metadata/{modelGuid}/properties        |
| [Fetch Specific Properties](/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-query-POST/) | POST /{urn}/metadata/{modelGuid}/properties:query |

## [Step 1 - Check the status of the translation job](#step-1-check-the-status-of-the-translation-job)

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/manifest' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

\_\_

When the translation job completes successfully, you will see a response similar to:

### Response

```
{
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA",
  "derivatives": [
    {
      "hasThumbnail": "true",
      "children": [
        {
          "urn": "urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA/output/Resource/model.sdb",
          "role": "Autodesk.CloudPlatform.PropertyDatabase",
          "mime": "application/autodesk-db",
          "guid": "6fac95cb-af5d-3e4f-b943-8a7f55847ff1",
          "type": "resource",
          "status": "success"
        },
        {
          "urn": "urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA/output/Resource/AECModelData.json",
          "role": "Autodesk.AEC.ModelData",
          "mime": "application/json",
          "guid": "a4aac952-a3f4-031c-4113-b2d9ac2d0de6",
          "type": "resource",
          "status": "success"
        },
        {

          "...truncated for clarity": ""

        }
      ],
      "name": "rac_basic_sample_project.rvt",
      "progress": "complete",
      "outputType": "svf2",
      "properties": {
        "Document Information": {
          "RVTVersion": "2020",
          "Project Name": "Sample House",
          "Project Number": "001-00",
          "Author": "Samuel Macalister",
          "Project Address": "Enter address here",
          "Project Issue Date": "Issue Date",
          "Project Status": "Project Status",
          "Building Name": "Samuel Macalister sample house design",
          "Client Name": "Autodesk",
          "Organization Name": "Autodesk",
          "Organization Description": ""
        }
      },
      "status": "success"
    },
    {
      "children": [
        {
          "urn": "urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA/output/preview1.png",
          "role": "thumbnail",
          "mime": "image/png",
          "guid": "db899ab5-939f-e250-d79d-2d1637ce4565",
          "type": "resource",
          "resolution": [
            100,
            100
          ],
          "status": "success"
        },
        {
          "urn": "urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA/output/preview2.png",
          "role": "thumbnail",
          "mime": "image/png",
          "guid": "3f6c118d-f551-7bf0-03c9-8548d26c9772",
          "type": "resource",
          "resolution": [
            200,
            200
          ],
          "status": "success"
        },
        {
          "urn": "urn:adsk.viewing:fs.file:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxfZGVyaXZhdGl2ZV9wcm9wX2VuaGFuY2VtZW50X3Rlc3RpbmcvcmFjX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA/output/preview4.png",
          "role": "thumbnail",
          "mime": "image/png",
          "guid": "4e751806-0920-ce32-e9fd-47c3cec21536",
          "type": "resource",
          "resolution": [
            400,
            400
          ],
          "status": "success"
        }
      ],
      "progress": "complete",
      "outputType": "thumbnail",
      "status": "success"
    }
  ],
  "hasThumbnail": "true",
  "progress": "complete",
  "type": "manifest",
  "region": "US",
  "version": "1.0",
  "status": "success"
}
```

Show More

\_\_

## [Step 2 - Retrieve a list of Viewables](#step-2-retrieve-a-list-of-viewables)

Once the source file has been translated to SVF2, you can retrieve a list of model view (metadata) IDs contained within the source file.

Note: Although the Revit file used in this walkthrough contains multiple model views, Fusion 360 and Inventor models contain only a single model view.

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/metadata' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

\_\_

### Response

```
{
    "data": {
        "type": "metadata",
        "metadata": [
            {
                "name": "{3D}",
                "role": "3d",
                "guid": "6bfb4886-f2ee-9ccb-8db0-c5c170220c40"
            },
            {
                "name": "A102 - Plans",
                "role": "2d",
                "guid": "abdacd31-f94c-e84f-9a58-4663e281d894"
            },
            {
                "name": "A104 - Elev./Sec./Det.",
                "role": "2d",
                "guid": "8be5a450-c03d-fcb2-6125-08d5baf4b9d9"
            },
            {
                "name": "A103 - Elevations/Sections",
                "role": "2d",
                "guid": "10f26e65-bbca-7a68-125e-749e559c1e3b"
            },
            {
                "name": "A105 - Elev./ Stair Sections",
                "role": "2d",
                "guid": "db90b95d-0265-5fe4-376a-4dd3386c3d7d"
            },
            {
                "name": "A101 - Site Plan",
                "role": "2d",
                "guid": "1fd6b2ec-267d-8ba3-6b00-abe1adf80994"
            },
            {
                "name": "A001 - Title Sheet",
                "role": "2d",
                "guid": "97e8b569-a295-8750-f788-2d5067608b9c"
            }
        ]
    }
}
```

Show More

\_\_

Note down the value of `guid` of the first model view (Viewable), which is named `{3D}`. In the next few steps we will use this value as `<GUID_OF_VIEWABLE>`.

## [Step 3 - Get object hierarchy](#step-3-get-object-hierarchy)

Once you know the GUID of a Viewable, you can get the object tree of that Viewable.

- Replace `<GUID_OF_VIEWABLE>` with the `guid` returned for the Viewable named `{3D}`.

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/metadata/<GUID_OF_VIEWABLE>' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

\_\_

Once you submit the request, the Model Derivative service starts extracting the object properties. If extracting properties takes time, the Model Derivative service will send you the following response. It implies that the request was accepted, but processing is still in progress. If you receive such a result, submit the request again.

### Response 1

```
{
  "result": "success"
}
```

\_\_

### Response 2

```
{
  "data": {
    "type": "objects",
    "objects": [
      {
        "objectid": 1,
        "objects": [
          {
            "objectid": 161,
            "objects": [
              {
                "objectid": 5409,
                "objects": [
                  {
                    "objectid": 5414,
                    "objects": [
                      {
                        "objectid": 435,
                        "name": "RPC Male"
                      }
                    ],
                    "name": "Alex"
                  }
                ],
                "name": "RPC Male"
              },
              {
                "objectid": 5408,
                "objects": [
                  {
                    "objectid": 5412,
                    "objects": [
                      {
                        "objectid": 566,
                        "name": "RPC Female"
                      },
                      {
                        "objectid": 565,
                        "name": "RPC Female"
                      },
                      {
                        "objectid": 617,
                        "name": "RPC Female"
                      }
                    ],
                    "name": "YinYin"
                  }
                ],
                "name": "RPC Female"
              },
              {
                "objectid": 5407,
                "objects": [
                  {
                    "objectid": 5410,
                    "objects": [
                      {
                        "objectid": 303,
                        "name": "M_RPC Beetle"
                      }
                    ],
                    "name": "M_RPC Beetle"
                  }
                ],
                "name": "M_RPC Beetle"
              }
            ],
            "name": "Entourage"
          },
          {

            "... truncated for clarity": ""

          }
        ],
        "name": "Model"
      }
    ]
  }
}
```

Show More

\_\_

## [Step 4 - Get object hierarchy (filtered)](#step-4-get-object-hierarchy-filtered)

Because the object tree can be very long, you can filter the list that is returned. If you know the `objectid` of the root node of a sub-tree, you can get the object tree for that sub tree. Note that it will also return the sub-trees of the siblings of that root node.

- Replace `<OBJECT_ID_OF_ROOT_OF_SUB_TREE>` with `161`, an `objectid` that was returned in the previous step.

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/metadata/<GUID_OF_VIEWABLE>?<OBJECT_ID_OF_ROOT_OF_SUB_TREE>' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

\_\_

```
{
    "data": {
        "type": "objects",
        "objects": [
            {
                "objectid": 161,
                "objects": [
                    {
                        "objectid": 5409,
                        "objects": [
                            {
                                "objectid": 5414,
                                "objects": [
                                    {
                                        "objectid": 435,
                                        "name": "RPC Male"
                                    }
                                ],
                                "name": "Alex"
                            }
                        ],
                        "name": "RPC Male"
                    },
                    {
                        "objectid": 5408,
                        "objects": [
                            {
                                "objectid": 5412,
                                "objects": [
                                    {
                                        "objectid": 566,
                                        "name": "RPC Female"
                                    },
                                    {
                                        "objectid": 565,
                                        "name": "RPC Female"
                                    },
                                    {
                                        "objectid": 617,
                                        "name": "RPC Female"
                                    }
                                ],
                                "name": "YinYin"
                            }
                        ],
                        "name": "RPC Female"
                    },
                    {
                        "objectid": 5407,
                        "objects": [
                            {
                                "objectid": 5410,
                                "objects": [
                                    {
                                        "objectid": 303,
                                        "name": "M_RPC Beetle"
                                    }
                                ],
                                "name": "M_RPC Beetle"
                            }
                        ],
                        "name": "M_RPC Beetle"
                    }
                ],
                "name": "Entourage"
            }
        ]
    }
}
```

Show More

\_\_

## [Step 5 - Retrieve properties of all objects in the Viewable](#step-5-retrieve-properties-of-all-objects-in-the-viewable)

Once you know the GUID of a Viewable, you can get the properties of all objects in that Viewable.

- Replace `<GUID_OF_VIEWABLE>` with the `guid` returned for the Viewable named `{3D}`

### Request

```
curl  -X GET \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/metadata/<GUID_OF_VIEWABLE>/properties' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>'
```

\_\_

Once you submit the request, the Model Derivative service starts extracting the object properties. If extracting properties takes time, the Model Derivative service will send you the following response. It implies that the request was accepted, but processing is still in progress. If you receive such a result, submit the request again.

### Response 1

```
{
  "result": "success"
}
```

\_\_

### Response 2

```
{
  "data": {
      "type": "properties",
      "collection": [
          {
              "objectid": 435,
              "name": "RPC Male",
              "externalId": "5ba82f05-9759-4b6e-8b19-8f869f7ed622-000e919b",
              "properties": {
                  "Identity Data": {
                      "Type Name": "Alex",
                      "Mark": "",
                      "Comments": "",
                      "Image": "",
                      "Code Name": "",
                      "OmniClass Title": "",
                      "OmniClass Number": "",
                      "Type Mark": "",
                      "Assembly Description": "",
                      "Cost": "0.000",
                      "Assembly Code": "",
                      "Description": "",
                      "URL": "",
                      "Type Comments": "",
                      "Manufacturer": "",
                      "Model": "",
                      "Keynote": "",
                      "Type Image": "",
                      "Render Appearance": "RPC-8-X9C2-NGU9-LXF5-4",
                      "Render Appearance Properties": "{2, 15},{22, RPC-8-X9C2-NGU9-LXF5-4},{1, 0},{1, 0},{2, 40},{1, 8},{5, Color},{1, 0},{1, 0},{3, 0.8},{3, 0.8},{3, 0.8},{1, 8},{7, BBoxMin},{1, 0},{1, 0},{1, 0},{1, 0},{1, 0},{1, 8},{7, BBoxMax},{1, 0},{1, 0},{1, 0},{1, 0},{1, 0},{2, 11},{9, RPCTypeId},{1, 0},{1, 0},{22, RPC-8-X9C2-NGU9-LXF5-4},{1, 6},{14, RPCPlantHeight},{1, 0},{1, 0},{7, 5.83333},{2, 11},{7, keyword},{1, 0},{1, 0},{18, :Geometry:RPC:Alex},{2, 11},{8, category},{1, 0},{1, 0},{16, :People [Casual]},{2, 11},{12, LocalizedUID},{1, 0},{1, 0},{4, Alex},{2, 14},{6, Height},{1, 0},{1, 0},{7, 5.83333},{1, 2},{16, Cast Reflections},{1, 0},{1, 0},{1, 0},{1, 2},{6, Jitter},{1, 0},{1, 0},{1, 1},{1, 2},{9, Billboard},{1, 0},{1, 0},{1, 0},{1, 2},{12, Cast Shadows},{1, 0},{1, 0},{1, 1},{1, 2},{20, Apply Filter Effects},{1, 0},{1, 0},{1, 0},{2, 11},{28, Apply Filter Effects-Text-FC},{1, 0},{1, 0},{4, None},{2, 11},{11, RPCFilePath},{1, 0},{1, 0},{84, C:\\RevitRender\\Version2015940\\2017\\assetlibrary_base.fbm\\RPCs\\ArchVision_C1_Alex.rpc},{2, 11},{20, AdvancedUIDefinition},{1, 0},{1, 0},{0, },{2, 11},{10, AssetLibID},{1, 0},{1, 0},{36, 4D3F6E72-3F99-4203-98E9-AF80B3C7A7A4},{2, 11},{10, BaseSchema},{1, 0},{1, 0},{9, RPCSchema},{2, 11},{12, ExchangeGUID},{1, 0},{1, 0},{0, },{1, 2},{6, Hidden},{1, 0},{1, 0},{1, 0},{1, 4},{11, RPCCategory},{1, 0},{1, 0},{1, 0},{2, 11},{8, RPCImage},{1, 0},{1, 0},{0, },{1, 4},{13, SchemaVersion},{1, 0},{1, 0},{1, 5},{2, 11},{12, UIDefinition},{1, 0},{1, 0},{0, },{2, 11},{6, UIName},{1, 0},{1, 0},{22, RPC-8-X9C2-NGU9-LXF5-4},{2, 11},{11, VersionGUID},{1, 0},{1, 0},{9, RPCSchema},{2, 11},{9, assettype},{1, 0},{1, 0},{11, RPCGeometry},{2, 11},{11, description},{1, 0},{1, 0},{0, },{2, 11},{9, localname},{1, 0},{1, 0},{3, RPC},{2, 11},{9, localtype},{1, 0},{1, 0},{3, RPC},{1, 4},{8, revision},{1, 0},{1, 0},{1, 1},{2, 11},{9, thumbnail},{1, 0},{1, 0},{0, },{1, 4},{7, version},{1, 0},{1, 0},{1, 1},{1, 2},{20, RPC_Cast Reflections},{1, 0},{1, 0},{1, 1},{1, 2},{10, RPC_Jitter},{1, 0},{1, 0},{1, 1},{1, 2},{13, RPC_Billboard},{1, 0},{1, 0},{1, 0},{1, 2},{16, RPC_Cast Shadows},{1, 0},{1, 0},{1, 1},{1, 2},{24, RPC_Apply Filter Effects},{1, 0},{1, 0},{1, 0},{2, 11},{32, RPC_Apply Filter Effects-Text-FC},{1, 0},{1, 0},{4, None},{21, assetlibrary_base.fbx},{1, 5},"
                  },
                  "Phasing": {
                      "Phase Demolished": "None",
                      "Phase Created": "Working Drawings"
                  },
                  "Constraints": {
                      "Moves With Nearby Elements": "No",
                      "Offset from Host": "-150.000 mm",
                      "Host": "Level : Ceiling",
                      "Level": "Ceiling"
                  },
                  "Dimensions": {
                      "Height": "0.000 mm"
                  }
              }
          },
          {

              "...truncated for clarity":""

          },
          {
              "objectid": 4268,
              "name": "Floor",
              "externalId": "Floor:Floors",
              "properties": {}
          },
          {
              "objectid": 91,
              "name": "Floors",
              "externalId": "Floors:",
              "properties": {}
          },
          {
              "objectid": 1,
              "name": "Model",
              "externalId": "doc",
              "properties": {
                  "Route Analysis": {
                      "Route Analysis Settings": ""
                  },
                  "Energy Analysis": {
                      "Energy Settings": ""
                  },
                  "Other": {
                      "Project Number": "001-00",
                      "Project Name": "Sample House",
                      "Project Address": "Enter address here",
                      "Client Name": "Autodesk",
                      "Project Status": "Project Status",
                      "Project Issue Date": "Issue Date"
                  },
                  "Identity Data": {
                      "Author": "Samuel Macalister",
                      "Building Name": "Samuel Macalister sample house design",
                      "Organization Description": "",
                      "Organization Name": "Autodesk"
                  }
              }
          }
      ]
  }
}
```

Show More

\_\_

## [Step 6 - Retrieve specific properties of specific objects in a Viewable](#step-6-retrieve-specific-properties-of-specific-objects-in-a-viewable)

The number of objects and their properties can be very large. The request in Step 5 would have resulted in more than 30,000 lines, had the response not been truncated. Such responses can take time and consume much bandwidth. Alternatively, you can query the objects you are interested in and request only the properties you need. The following request retrieves all objects whose names begin with `M_Pile-Steel`, and retrieves all properties that are categorized as `Dimensions`. The results are paginated, and the response shows page 2 of a page that can contain no more than 5 objects.

### Request

```
curl  -X POST \
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/<URL_SAFE_URN_OF_SOURCE_FILE>/metadata/<GUID_OF_VIEWABLE>/properties:query' \
      -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
      -H 'Content-Type: application/json' \
      -d '{
              "query": {
                  "$prefix": [
                      "name",
                      "M_Pile-Steel"
                  ]
              },
              "fields": [
                  "objectid",
                  "name",
                  "externalId",
                  "properties.Dimensions"
              ],
              "pagination": {
                  "offset": 5,
                  "limit": 5
              },
              "payload": "text"
          }'
```

Show More

\_\_

### Response
