[Documentation](/developer/documentation) /

[Model Derivative API](/en/docs/model-derivative/v2) /

[Reference Guide](/en/docs/model-derivative/v2/reference)

Create Translation Job

POST

# job

Creates a job to translate the specified source design from one format to another, generating derivatives of the source design. You can optionally:

* Extract selected parts of a design and export the set of geometries to the OBJ format.
* Generate different-sized thumbnails.

Follow the [step-by-step tutorials](/en/docs/model-derivative/v2/tutorials) for detailed instructions on how to use this operation to translate files, extract geometries, and generate thumbnails.

When the translation job runs, progress information and details of the generated derivatives are logged to a JSON file that is called a manifest. A manifest is typically created the first time you translate the source design. Thereafter the system updates the same manifest each time a translation job is executed for that source design. If necessary, you can set the `x-ads-force` header to `true`, which deletes the existing manifest and creates a fresh manifest. However, if you do so, all derivatives generated prior to this are deleted.

A translation job is asynchronous and runs as a background process. There is no need not keep the HTTP connection open until the job completes. Use [Fetch Manifest](/en/docs/model-derivative/v2/reference/http/urn-manifest-GET) to check for the job’s completion status.

## [Resource Information](#resource-information)

| Method and URI         | POSThttps\://developer.api.autodesk.com/modelderivative/v2/designdata/job            |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Method and URI (EMEA)  | POSThttps\://developer.api.autodesk.com/modelderivative/v2/regions/eu/designdata/job |
| Authentication Context | user context optional                                                                |
| Required OAuth Scopes  | `data:read` _and_ (`data:write` _or_ `data:create`)                                  |
| Data Format            | JSON                                                                                 |
| Rate Limit             | 500 calls per minute                                                                 |

### Request

## [Headers](#headers)

| Authorization\*string              | Must be `Bearer <token>`, where `<token>` is obtained via [POST /authentication/v2/token](/en/docs/oauth/v2/reference/http/gettoken-POST)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Type\*string               | Must be `application/json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| regionenum:string                  | Specifies where to store the manifest and derivatives. Possible values are:- `US` : (Default) Data center for the US region.
- `EMEA` : Data center for the European Union, Middle East, and Africa regions.
- `AUS` : (Beta) Data centre for the Australia region.**Note:**- Beta features are subject to change. Please avoid using them in production environments.
- The Model Derivative service ignores this parameter if you use the EMEA URI for this operation.
- Calling this operation twice for the same source design with different values for this parameter creates two distinct sets of manifests and derivatives. See [GDPR Compliance](/en/docs/model-derivative/v2/developers_guide/regions/) for more information.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| x-ads-forcebool                    | * `true`: Deletes the existing manifest and derivatives of the source design before translation.
* `false`: (Default) Updates existing manifest and generates derivatives only for the formats that the source design has no derivatives.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| x-ads-derivative-formatenum:string | Specifies how to interpret the `formats.advanced.objectIds` request body attribute for OBJ output. Possible values are:* `latest`: (Default) Consider `formats.advanced.objectIds` to be SVF2 Object IDs.
* `fallback`: Consider `formats.advanced.objectIds` to be SVF Object IDs.**Note**1) This parameter applies only to designs with legacy SVF derivatives generated by the BIM 360 Docs service.

2) The BIM 360 Docs service now generates SVF2 derivatives. SVF2 Object IDs may not be compatible with the SVF Object IDs previously generated by the BIM 360 Docs service. Setting this header to `fallback` may resolve backward compatibility issues resulting from Object IDs of legacy SVF derivatives being retained on the client side.

3) If you use this header with one derivative (URN), you must use it consistently across the following operations for that derivative.

   * [Create Translation Job](/en/docs/model-derivative/v2/reference/http/job-POST) (for OBJ output)
   * [Fetch Object Tree](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-GET/)
   * [Fetch All Properties](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-properties-GET/)
   * [Fetch Specific Properties](/en/docs/model-derivative/v2/reference/http/metadata/urn-metadata-guid-properties-query-POST/) |

\* Required

### Request

## [Body Structure](#body-structure)

### Attributes that Apply to All Outputs

__Expand all

| __input\*object           | An object describing the attributes of the source design.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| __urn\*string             | The URL safe Base64 encoded URN of the source design.**Note:** The URN is returned as the `objectID` once you complete uploading the source design to APS. This value must be converted to a [Base64 (URL Safe) encoded](http://www.freeformatter.com/base64-encoder.html) string before you can specify it for this attribute.                                                                                                                                                                                                                                                                                                                  |
| __compressedUrnbool       | * `true`: The source design is compressed as a zip file. The design can consist of a single file or as in the case of Autodesk Inventor, multiple files. If set to `true`, you must specify the `rootFilename` attribute.
* `false`: (Default) The source design is not compressed.                                                                                                                                                                                                                                                                                                                                                              |
| __rootFilenamestring      | The file name of the top-level component of the source design. Mandatory if `compressedUrn` is set to true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| __checkReferencesbool     | - `true`: Instructs the server to check for references and download all referenced files. If the design consists of multiple files (as with Autodesk Inventor assemblies) the translation job fails if this attribute is not set to `true`.
- `false`: (Default) Does not check for any references.Set this attribute to true if the design specified by the `input.urn` attribute contains references (for example, an Inventor assembly file). Refer to the tutorial [Translate a Source File that Contains References](/en/docs/model-derivative/v2/tutorials/translate-source-file-containing-xref/) for an example usage of this attribute. |
| __output\*object          | An object describing the attributes of the requested derivatives.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| __destinationobject       | ![DEPRECATED](https://developer.doc.autodesk.com/bPlouYTd/A360-platform-viewing-docs-master-355085/_images/badge_deprecated.svg) Group of destination settings.**Note:** This attribute is replaced by the `region` header.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| __regionstring            | ![DEPRECATED](https://developer.doc.autodesk.com/bPlouYTd/A360-platform-viewing-docs-master-355085/_images/badge_deprecated.svg) Region in which to store outputs. Use the `region` header to specify what region to store outputs.**Note:** This attribute is replaced by the `region` header.                                                                                                                                                                                                                                                                                                                                                  |
| __formats\*array: object  | Group of requested formats/types. User can request multiple formats.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| __type\*string            | The requested output types. Possible values: `dwg`, `fbx`, `ifc`, `iges`, `obj`, `step`, `stl`, `svf`, `svf2`, `thumbnail`. For a list of supported types, call the [List Supported Formats](/en/docs/model-derivative/v2/reference/http/formats-GET) operation.                                                                                                                                                                                                                                                                                                                                                                                 |
| __miscobject              | Group of misc parameters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| __workflowstring          | The workflow id created for a webhook, used to listen to Model Derivative events. It needs to be no more than 36 chars, and only ASCII, decimal and hyphen are accepted.Refer to the tutorial [Creating a Webhook and Listening to Events](/en/docs/webhooks/v1/tutorials/create-a-hook-model-derivative) for details.                                                                                                                                                                                                                                                                                                                           |
| __workflowAttributeobject | A user-defined JSON object, which you can use to set some custom workflow information. It needs to be less than 1KB and will be ignored if `misc.workflow` parameter is not set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

\* Required

### Attributes that Apply to SVF or SVF2 Outputs

**Case 1 - Input file type is not RVT, IFC, NWD, or VUE:**

__Expand all

| __formats\*object      | A JSON object representing the requested output types.                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| __type\*string         | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type. |
| __views\*array: string | Possible values: `2d`, `3d`                                                                                         |

\* Required

**Case 2 - Input file type is DGN:**

__Expand all

| __formats\*object                  | A JSON object representing the requested output types.                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string                     | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                  |
| __views\*array:string              | Possible values: `2d`, `3d`                                                                                                                                          |
| __advancedobject                   | A set of special options applicable when the input file type is DGN.                                                                                                 |
| __requestedLinkageIDsarray:integer | An array containing user data linkage IDs of the linkage data to be extracted from the DGN file. Linkage data is not extracted if you do not specify this attribute. |

\* Required

**Case 3 - Input file type is DWG:**

__Expand all

| __formats\*object      | A JSON object representing the requested output types.                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string         | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                                                                                                                                         |
| __views\*array: string | Possible values: `2d`, `3d`                                                                                                                                                                                                                                                                 |
| __advancedobject       | A set of special options applicable when the input file type is DWG.                                                                                                                                                                                                                        |
| __2dviewsenum: string  | The format that 2D views must be rendered to. Available options are:- **legacy** - (Default) Render to a model derivative specific file format.
- **pdf** - Render to the PDF file format. If you choose this option, only properties with semantic values are extracted from the DWG file. |

\* Required

**Case 4 - Input file type is IFC:**

__Expand all

| __formats\*object        | A JSON object representing the requested output types.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string           | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| __views\*array: string   | Possible values: `2d`, `3d`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| __advancedobject         | A set of special options applicable when the input file type is IFC.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| __switchLoaderbool       | ![DEPRECATED](https://developer.doc.autodesk.com/bPlouYTd/A360-platform-viewing-docs-master-355085/_images/badge_deprecated.svg) Switches the IFC loader from the Navisworks IFC loader to the new Revit IFC loader, when translating from the IFC input format to SVF. This attribute defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| __conversionMethodstring | Specifies the IFC loader to use during translation. Available options are:- `legacy` - Use IFC loader version 1, which is based on the Navisworks IFC loader. Supports IFC 2x3.
- `modern` - Use IFC loader version 2, which is based on the Revit IFC loader. Supports IFC 2x3 and IFC 4.
- `v3` - Use IFC loader version 3, which is based on the Revit IFC loader. Supports IFC 2x3, IFC 4, and IFC 4.3.
- `v4` - **(Recommended)** Use IFC loader version 4, which is a native solution specifically designed for Autodesk Platform Services (APS). It does not depend on Navisworks or Revit. Supports IFC 2x3, IFC 4, and IFC 4.3.If both `switchLoader` and `conversionMethod` are specified, Model Derivative uses the `conversionMethod` parameter. If `conversionMethod` is not specified, Model Derivative uses the `switchLoader` parameter. |
| __buildingStoreysstring  | Specifies how storeys are translated. Available options are:- `hide` - **(Default)** storeys are extracted but not visible by default.
- `show` - storeys are extracted and are visible by default.
- `skip` - storeys are not translated.**Note** These options do not apply when `conversionMethod` is set to `legacy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| __spacesstring           | Specifies how spaces are translated. Available options are:- `hide` - **(Default)** spaces are translated but are not visible by default.
- `show` - spaces are translated and are visible by default.
- `skip` - spaces are not translated.**Note** These options do not apply when `conversionMethod` is set to `legacy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| __openingElementsstring  | An option to be specified when the input file type is IFC. Specifies how openings are translated. Available options are:- `hide` - **(Default)** openings are translated but are not visible by default.
- `show` - openings are translated and are visible by default.
- `skip` - openings are not translated.**Note** These options do not apply when `conversionMethod` is set to `legacy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

\* Required

**Case 5 - Input file type is NWD:**

__Expand all

| __formats\*object                | A JSON object representing the requested output types.                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string                   | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                                            |
| __views\*array: string           | Possible values: `2d`, `3d`                                                                                                                                                                    |
| __advancedobject                 | A set of special options applicable when the input file type is Navisworks.                                                                                                                    |
| __hiddenObjectsbool              | Specifies whether hidden objects must be extracted or not.- `true`: Extract hidden objects from the input file.
- `false`: **(Default)** Do not extract hidden objects from the input file.    |
| __basicMaterialPropertiesbool    | Specifies whether basic material properties must be extracted or not.- `true`: Extract properties for basic materials.
- `false`: **(Default)** Do not extract properties for basic materials. |
| __autodeskMaterialPropertiesbool | Specifies how to handle Autodesk material properties.- `true`: Extract properties for Autodesk materials.
- `false`: **(Default)** Do not extract properties for Autodesk materials.           |
| __timelinerPropertiesbool        | Specifies whether timeliner properties must be extracted or not.- `true`: Extract timeliner properties.
- `false`: **(Default)** Do not extract timeliner properties.                          |

\* Required

**Case 6 - Input file type is RVT:**

__Expand all

| __formats\*object              | A JSON object representing the requested output types.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string                 | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| __views\*array: string         | Possible values: `2d`, `3d`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| __advancedobject               | A set of special options applicable when the input file type is Revit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| __2dviewsenum: string          | The format that 2D views must be rendered to. Available options are:- `legacy` - (Default) Render to a model derivative specific file format.
- `pdf` - Render to the PDF file format. This option applies only to Revit 2022 files and newer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| __extractorVersionenum: string | Specifies what version of the Revit translator/extractor to use. Possible values:- `next` - Makes the translation job use the newest available version of the translator/extractor. This option is meant to be used by beta testers who wish to test a pre-release version of the translator. If no pre-release version is available, this option makes the translation job use the current official release version.
- `previous` - Makes the translation job use the previous official release version of the translator/extractor. This option is meant to be used as a workaround in case of regressions caused by a new official release of the translator/extractor.If this attribute is not specified, the system uses the current official release version. |
| __generateMasterViewsbool      | Generates master views when translating from the Revit input format to SVF. This option is ignored for all other input formats. This attribute defaults to `false`.Master views are 3D views that are generated for each phase of the Revit model. A master view contains all elements (including “room” elements) present in the host model for that phase. The display name of a master view defaults to the name of the phase it is generated from. However, if a view with that name already exists, the Model Derivative service appends a suffix to the default display name.**Notes**:1) Master views do not contain elements from linked models.
2) Enabling this option can increase the time it takes to translate the model.                             |
| __materialModestring           | Specifies the materials settings to apply to the generated derivatives. Available options are:- `auto` - **(Default)** Use the current setting of the default view of the input file.
- `basic` - Use basic materials.
- `autodesk` - Use Autodesk materials.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

\* Required

**Case 7 - Input file type is VUE:**

__Expand all

| __formats\*object      | A JSON object representing the requested output types.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string         | The requested output type. Valid values are:- `svf` - for the SVF output type.
- `svf2` - for the SVF2 output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| __views\*array: string | Possible values: `2d`, `3d`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| __advancedobject       | A set of special options applicable when the input file type is VUE.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| __hierarchyenum        | Specifies how the hierarchy of items are determined.- `Classic`: **(Default)** Uses hardcoded rules to set the hierarchy of items.
- `SystemPath`: Uses a linked XML or MDB2 properties file to set hierarchy of items. You can use this option to make the organization of items consistent with SmartPlant 3D.**Notes:**1) The functioning of the `SystemPath` depends on the default setting of the property `SP3D_SystemPath` or `System Path`.
2) The pathing delimiter must be `\`.
3) If you want to customize further, import the VUE file to Navisworks. After that, use POST job on the resulting Navisworks (nwc/nwd) file. |

\* Required

### Attributes that Apply to Thumbnail Outputs

__Expand all

| __formats\*object | A JSON object representing the requested output types.                        |
| ----------------- | ----------------------------------------------------------------------------- |
| __type\*string    | The requested output type. Must be `thumbnail` for the thumbnail output type. |
| __advancedobject  | Advanced options for `thumbnail` type.                                        |
| __widthint        | Set the width. Possible values: `100`, `200`, `400`                           |
| __heightint       | Set the height. Possible values: `100`, `200`, `400`                          |

\* Required

### Attributes that Apply to STL Outputs

__Expand all

| __formats\*object                 | A JSON object representing the requested output types.                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string                    | The requested output type. Must be `stl` for the STL output type.                                                                              |
| __advancedobject                  | Advanced options for `stl` output type.                                                                                                        |
| __formatstring                    | Default format is `binary`. Possible values: `binary`, `ascii`                                                                                 |
| __exportColorbool                 | Color is exported by default. If set to `true`, color is exported. If set to `false`, color is not exported.                                   |
| __exportFileStructureenum: string | * `single` (Default): creates one STL file for all the input files (assembly file).
* `multiple`: creates a separate STL file for each object. |

\* Required

### Attributes that Apply to STEP Outputs

__Expand all

| __formats\*object           | A JSON object representing the requested output types.                                                                                                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string              | The requested output type. Must be `step` for the STEP output type.                                                                                                                                                                                                     |
| __advancedobject            | Advanced options for `step` output type.                                                                                                                                                                                                                                |
| __applicationProtocolstring | A STEP file can be generated with the following application protocols:- `203` for configuration controlled design,
- `214` for core data for automotive mechanical design processes,
- `242` for managed model based 3D engineering.By default, `214` will be exported. |
| __tolerancefloat            | Possible values: between `0` and `1`. By default it is set at 0.001.                                                                                                                                                                                                    |

\* Required

### Attributes that Apply to IGES Outputs

__Expand all

| __formats\*object   | A JSON object representing the requested output types.                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| __type\*string      | The requested output type. Must be `iges` for the IGES output type.                                          |
| __advancedobject    | Advanced options for `iges` output type.                                                                     |
| __tolerancefloat    | Possible values: between `0` and `1`. By default it is set at 0.001.                                         |
| __surfaceTypestring | Possible values: `bounded`, `trimmed`, `wireframe`. By default it is set to `bounded` surface.               |
| __sheetTypestring   | Export the sheet body to IGES `open`, `shell`, `surface` or `wireframe`. By default, it is set to `surface`. |
| __solidTypestring   | Export the solid body to IGES `solid`, `surface` or `wireframe`. By default, it is set to `solid`.           |

\* Required

### Attributes that Apply to OBJ Outputs

__Expand all

| __formats\*object                | A JSON object representing the requested output. types.                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string                   | The requested output type. Must be `obj` for the OBJ output type.                                                                                                                                                                                                                                                                                                                                                                                         |
| __advancedobject                 | Advanced options for `obj` output type.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| __exportFileStructureenum:string | _Ignored for geometry extraction_.- `single` (default): creates one OBJ file for all the input files (assembly file).
- `multiple`: creates a separate OBJ file for each input file.                                                                                                                                                                                                                                                                      |
| __unitenum:string                | Translate models into different units; this causes the values to change. For example, from millimeters (10, 123, 31) to centimeters (1.0, 12.3, 3.1). If the source unit or the unit you are translating into is not supported, the values remain unchanged. Possible values:- `meter`, `decimeter`, `centimeter`, `millimeter`, `micrometer`, `nanometer`
- `yard`, `foot`, `inch`, `mil`, `microinch`Note that this feature does not support F3D files. |
| __modelGuidstring                | _Required for geometry extraction_. The model view ID (guid). Currently only valid for 3d views.                                                                                                                                                                                                                                                                                                                                                          |
| __objectIdsarray: int            | _Required for geometry extraction_. List object ids to be translated. -1 will extract the entire model. Currently only valid for 3d views.                                                                                                                                                                                                                                                                                                                |

\* Required

### Attributes that Apply to DWG Outputs

Note that when translating RVT to DWG, it only translates the `selected` 2D views of the model. You can choose which of the 2D views you need to translate (to DWG) through the Revit addon `Publish Settings`. If nothing selected, all sheet views (if any) would be translated by default.

__Expand all

| __formats\*object         | A JSON object representing the requested output types.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string            | The requested output type. Must be `dwg` for the DWG output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| __advancedobject          | Advanced options for `dwg` output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| __exportSettingNamestring | The export settings should be one of the DWG Export settings name pre-saved in the document.If the string is invalid, or the specified settings name is not found in the document, one of the following would be used according to the following priority.1) The `active` settings in the document retrieved by Revit API `public static ExportDWGSettings GetActivePredefinedSettings(Document aDoc)` on the document. The `active` settings are the settings selected in the Modify DWG Export dialog and saved in the document.

2) The `default` settings, which are the values set by default when a Revit API object is created from the class `DWGExportOptions`.

   * _Revit API_ `public static IList<string> ListNames(Document aDoc)`: Returns a list of names of all the pre-defined DWG export settings in the document.
   * _Revit API_ `public static ExportDWGSettings FindByName(Document aDoc, string name)`: Returns the pre-defined non-in-session exporting settings for DWG in the given document with the specified name.Please refer to [Export to DWG or DXF](https://www.autodesk.com/revit-help/?contextId=HID_EXPORT_DWG) and [Revit API Developers Guide](https://www.autodesk.com/revit-help?contextId=HID_DEV_GUIDE_HOME) in Revit help for details. |

\* Required

### Attributes that Apply to IFC Outputs

Note that when translating RVT to IFC, it does not matter whether or not there is a 3D view in the model. All the elements in the model would be translated to IFC.

__Expand all

| __formats\*object         | A JSON object representing the requested output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __type\*string            | The requested output type. Must be `ifc` for the IFC output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| __advancedobject          | Advanced options for `ifc` output type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| __exportSettingNamestring | The export settings should be one of the IFC Export settings pre-saved in the document.If the string is invalid, or the specified settings are not found in the document, the system will use the default settings. The default settings are obtained by creating a Revit API object from the class IFCExportOptions.The list of settings pre-saved in the document can be accessed from Revit dialog ‘Export IFC’. But there is currently no Revit API for getting this data from the document.Please refer to [Exporting to Industry Foundation Classes (IFC)](https://www.autodesk.com/revit-help/?contextId=HDIALOG_REVIT_EXPORTIFCHELP) and [Revit API Developers Guide](https://www.autodesk.com/revit-help?contextId=HID_DEV_GUIDE_HOME) for more details. |

\* Required

### Response

## [HTTP Status Code Summary](#http-status-code-summary)

| 200OK                     | Success. Note that you still need to check whether the asynchronous job is complete by calling the [Fetch Manifest](/en/docs/model-derivative/v2/reference/http/urn-manifest-GET) operation. |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 201CREATED                | The requested file type has been previously generated and has not been replaced by the new source file.                                                                                      |
| 400BAD REQUEST            | Invalid request. E.g., the input URN format is invalid.                                                                                                                                      |
| 401UNAUTHORIZED           | Invalid authorization header.                                                                                                                                                                |
| 403FORBIDDEN              | Access denied regardless of authorization status.                                                                                                                                            |
| 404NOT FOUND              | Endpoint does not exist.                                                                                                                                                                     |
| 406NOT ACCEPTABLE         | The request is not acceptable. E.g., the output type is not supported.                                                                                                                       |
| 409CONFLICT               | The request conflicts with a previous request that is still in progress.                                                                                                                     |
| 429TOO MANY REQUEST       | Rate limit exceeded (500 requests per minute); wait some time before retrying.                                                                                                               |
| 500INTERNAL SERVICE ERROR | Unexpected service interruption.                                                                                                                                                             |

### Response

## [HTTP Headers](#http-headers)

| x-ads-app-identifierstring | The service identifier comprise service name, version and environment.  |
| -------------------------- | ----------------------------------------------------------------------- |
| x-ads-startup-timestring   | The service startup time with data format `EEE MMM dd HH:mm:ss Z yyyy`. |
| x-ads-durationstring       | The request duration in milliseconds.                                   |

### Response

## [Body Structure (200/201)](#body-structure-200-201)

| resultstring              | reporting success status                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| urnstring                 | the urn identifier of the source file                                                            |
| acceptedJobsarray: object | list of the requested outputs                                                                    |
| outputarray: object       | identical to the request body. For more information please see the request body structure above. |

### Response

## [Body Structure (400)](#body-structure-400)

| diagnosticsstring | reason for failure |
| ----------------- | ------------------ |

## [Example 1](#example-1)

A successful attempt kicking off a job for the translation of an Inventor model to SVF2, where the source files are packaged as a single zip file (200).

**Note:** This request does not explicitly specify a `region` header. So, the system assumes the default region, which is `US`.

### Request

```
curl -X 'POST' \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL'
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job' \
     -d
      '{
         "input": {
           "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA",
           "compressedUrn": true,
           "rootFilename": "A5.iam"
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

__

### Response

```
Status Code: 200 OK
Content-Type:application/json;charset=utf-8
Access-Control-Allow-Credentials:true
Access-Control-Allow-Origin:*
x-ads-app-identifier:platform-viewing-2016.05.03.1102.2f6bfbf-production
x-ads-startup-time:Wed May 11 14:03:54 CST 2016
x-ads-duration:280 ms

{
  "result": "success",
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA",
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

__

## [Example 2](#example-2)

A successful attempt kicking off a job for the translation of an Inventor part file to SVF2. The derivatives are to be stored in the in the EMEA region.

### Request

```
curl -X 'POST' \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL...' \
     -H 'region: EMEA' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job' \
     -d '{
             "input": {
                 "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6anBfZW1lYV9idWNrZXQvYm94LmlwdA=="
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

__

### Response

```
Status Code: 200 OK
Content-Type:application/json;charset=utf-8
Access-Control-Allow-Credentials:true
Access-Control-Allow-Origin:*
x-ads-app-identifier:platform-viewing-2023.11.01.52.7902cdefa-production
x-ads-startup-time:Mon Nov 27 04:47:37 UTC 2023
x-ads-duration:1083 ms

{
    "result": "success",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6anBfZW1lYV9idWNrZXQvYm94LmlwdA",
    "acceptedJobs": {
        "output": {
            "formats": [
                {
                    "type": "svf2",
                    "views": [
                        "2d",
                        "3d"
                    ]
            ]
        }
    }
}
```

Show More

__

## [Example 3](#example-3)

Illustrates what happens when you kick off a job for a source file that was translated previously (201).

### Request

```
curl -X 'POST' \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL' \
     -H 'x-ads-force: false' -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job' \
     -H 'region: US' \
     -d '{
           "input": {
             "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA",
             "compressedUrn": true,
             "rootFilename": "A5.iam"
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

__

### Response

```
Status Code: 201 Created
Content-Type:application/json;charset=utf-8
Access-Control-Allow-Credentials:true
Access-Control-Allow-Origin:*
x-ads-app-identifier:platform-viewing-2016.05.03.1102.2f6bfbf-production
x-ads-startup-time:Wed May 11 14:03:54 CST 2016
x-ads-duration:280 ms

{
  "result": "created",
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA",
  "acceptedJobs": {
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

__

## [Example 4](#example-4)

A successful attempt at starting a job to export geometry corresponding to the specified object ids to the OBJ format (200).

### Request

```
curl -X 'POST' \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'Authorization: Bearer PtnrvrtSRpWwUi3407QhgvqdUVKL' \
     -v 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job' \
     -d
'{
   "input": {
     "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA"
   },
   "output": {
     "formats": [
       {
         "type": "obj",
         "advanced": {
           "modelGuid": "4f981e94-8241-4eaf-b08b-cd337c6b8b1f",
           "objectIds": [
             2,
             3,
             4
           ]
         }
       }
     ]
   }
 }'
```

Show More

__

### Response

```
Status Code: 200 OK
Content-Type:application/json;charset=utf-8
Access-Control-Allow-Credentials:true
Access-Control-Allow-Origin:*
x-ads-app-identifier:platform-viewing-2016.05.03.1102.2f6bfbf-production
x-ads-startup-time:Wed May 11 14:03:54 CST 2016
x-ads-duration:280 ms

{
  "result": "success",
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWxkZXJpdmF0aXZlL0E1LnppcA",
  "acceptedJobs": {
    "output": {
      "destination": {
        "region": "us"
      },
      "formats": [
        {
          "type": "obj",
          "advanced": {
            "modelGuid": "4f981e94-8241-4eaf-b08b-cd337c6b8b1f",
            "objectIds": [
              2,
              3,
              4
            ]
          }
        }
      ]
    }
  }
}
```

Show More

__