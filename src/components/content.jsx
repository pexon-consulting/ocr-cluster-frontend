import React, {useCallback, useEffect, useRef, useState} from 'react';
import {JSONTree} from 'react-json-tree';
import OCRResultTabs from "./ocrResultTab";
import axios from 'axios';
import UploadContainer, {BannerContainer, BannerContent, BannerImage, CardContainer} from '.././styles/banner';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import 'react-dropdown/style.css';
import {useDropzone} from "react-dropzone";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import properties from '.././config/properties.json';
import {useMsal} from "@azure/msal-react";
import {loginRequest} from "../authConfig";
import Papa from "papaparse"
import NewWindow from 'react-new-window'
import IWindowFeatures from 'react-new-window'
// import {Popup} from "./popup";
import Popup from 'reactjs-popup';
import ReactDropdown from "react-dropdown";

const version = "2024-03-27 - 0.51.0"

// import {Dropdown} from "react-bootstrap";

function Content() {

    const [processData, setProcessData] = useState({data: []});
    const [isUploaded, setIsUploaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isFetched, setIsFetched] = useState(false);
    const [isOneDocumentRetreive, setIsOneDocumentRetreive] = useState(false);
    const [isOpenCsv, setOpenCsv] = useState(false);
    const [versionPresent, setVersionPresent] = useState(false);
    const [err, setErr] = useState('');
    const [deviceId, setDeviceId] = useState(properties.defaultDeviceId);
    const [features, setFeatures] = useState(properties.defaultFeatures);
    const [requesterApplication, setRequesterApplication] = useState(properties.defaultRequester);
    const [documentType, setDocumentType] = useState("");
    const [tenant, setTenant] = useState('');
    const [processId, setProcessId] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [debugSelected, setDebugSelected] = useState(properties.defaultDebug === "true");
    const [extended, setExtended] = useState('MAX');
    const updatedDeviceId = useRef(deviceId);
    const updatedFeatures = useRef(features);
    const updatedRequester = useRef(requesterApplication);
    const updatedDocumentType = useRef(documentType);
    const updatedTenant = useRef(tenant);
    const updatedExtended = useRef(extended);
    const [versionData, setVersionData] = useState()
    const [open, setOpen] = useState(false);

    // State to store parsed data
    const [parsedData, setParsedData] = useState([]);

    //State to store table Column name
    const [tableRows, setTableRows] = useState([]);

    //State to store the values
    const [values, setValues] = useState([]);

    const width = window.screen.width * 0.7
    const height = window.screen.height * 0.7

    const windowFeatures: IWindowFeatures = {
        height: height,
        width: width
    }

    const {instance, accounts, inProgress} = useMsal();
    let token = ""
    const [prevtoken, setPrevtoken] = useState('');

    let testFile: File;

    function logout() {
        console.log("logging out...")
        if (window.STAGE === "MAIN" || window.STAGE === "DEMO") {
            return
        }
        window.localStorage.clear();
        console.log("storage cleared")
        window.location.reload()
    }

    // async function RequestAccessToken() {
    //     if (window.STAGE === "MAIN" || window.STAGE === "DEMO") {
    //         token = properties.defaultToken
    //         return
    //     }
    //     //console.log("name logged in: " + accounts[0].name)
    //     let tokenResponse = await instance.handleRedirectPromise();
    //     let accountObject;
    //     if (tokenResponse) {
    //         accountObject = tokenResponse.account;
    //     } else {
    //         accountObject = instance.getAllAccounts()[0];
    //     }
    //     try {
    //         if (accountObject && tokenResponse) {
    //             //console.log("got valid accountObject and tokenResponse")
    //         } else if (accountObject) {
    //             //console.log("user logged in but no tokens")
    //             try {
    //                 tokenResponse = await instance.acquireTokenSilent({
    //                     account: accountObject, scopes: loginRequest.scopes
    //                 });
    //             } catch (err) {
    //                 await instance.acquireTokenRedirect(loginRequest)
    //             }
    //         } else {
    //             //console.log("no accountObject or tokenResponse")
    //             await instance.loginRedirect(loginRequest)
    //         }
    //     } catch (err) {
    //         console.error(err)
    //     }
    //     //console.log(tokenResponse.accessToken)
    //     //console.log("token response:")
    //     //console.log(tokenResponse)
    //     token = tokenResponse.idToken
    //     if (token === undefined) {
    //         console.log("redirecting to logout")
    //         logout()
    //     }
    //     if (prevtoken != token) {
    //         console.log("name logged in: " + accounts[0].name)
    //         console.log("token set: " + token)
    //         setPrevtoken(token)
    //     }
    // }

    const disabled = false;

    const onDrop = useCallback(acceptedFiles => {
        console.log("in onDrop")
        onClear();
        console.log(acceptedFiles)
        console.log(acceptedFiles[0])
        testFile = acceptedFiles[0]
        console.log("selected file: " + testFile)
        setIsUploading(false);
        setIsUploaded(false);
        onFileUpload();
    }, []);

    const {getRootProps, getInputProps, isDragAccept} = useDropzone({
        onDrop,
        // maxFiles: 1
    });

    const handleDocumentType = event => {
        console.log("doc type:")
        console.log(event)
        console.log(event.value)
        setDocumentType(() => {
            updatedDocumentType.current = event.value;
            return event.value;
        });
    }

    const handleTenant = event => {
        setTenant(() => {
            updatedTenant.current = event.target.value;
            return event.target.value;
        });
    }

    const onExtendedValue = event => {
        console.log(event.target.value)
        setExtended(() => {
            updatedExtended.current = event.target.value;
            return event.target.value;
        })
    }

    const handleRequester = event => {
        setRequesterApplication(() => {
            updatedRequester.current = event.target.value;
            return event.target.value;
        });
    }

    const handleDeviceId = event => {
        setDeviceId(function () {
            updatedDeviceId.current = event.target.value;
            return event.target.value;
        });
    }

    const handleFeatures = event => {
        setFeatures(function () {
            updatedFeatures.current = event.target.value;
            return event.target.value;
        });
    }

    const handleProcessId = event => {
        setProcessId(event.target.value);
    }

    const handleDocumentId = event => {
        setDocumentId(event.target.value);
    }

    async function onSearch() {
        await onCallSearch(processId, documentId)
    }

    async function onDownload() {
        await onFileDownload(processId, documentId)
    }

    function getS3Url(): String {
        return "https://eop-report-main.s3.eu-west-1.amazonaws.com/result.csv?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGcaDGV1LWNlbnRyYWwtMSJHMEUCIQDpgp3K0KgtxiZ9ZPWu%2FxiUbp6qXjqW2efKeKpZy8x6CgIgdRo%2BAlu33mF7pqa2Y%2Bw6g0N2VVhfBWs7Z8PZ%2FYWY3zMqhQMIQBAAGgw5OTQzMTg5OTEyNjYiDCTxnI2fEnAt5mtyPyriAli7%2Bmo0l2DMBITEhgWf3H9PjNX4ELeX8ZReRlyKP7%2BF%2FW22YhPCmGSJklfHtkOwU4c6RroWwAccwaMkwQ7K3%2BXrXDkmppZLufWzGByjXPTn9MxLZRzIzFWYE0A2SiSgQpUN5ZAQVEtImN7lpGwKg%2BZR1Eib1wc%2BJ0LGxTz7%2F55NOXa7zenpxrFnybMr7PmlZjvtW1Cl7VYqJOvYstjNInMFQTZXFgZioBbnaaK3J%2FZ4tqwhII8taIjAj4%2BilqekbRygy1TvR1rZTaX%2BQv3bVtnoEAn7XnrYDz8OureHfljDT7WjChmqMw%2BmhjqDqZ1hFkcD6VM%2BM292MgxGMC0cttg3sdg%2BlK58Y%2F1DXHoooSeBxCjW92UjgxSbh9qi4MO3DbSct7X6e8ZZxsHeHxxx1XKJhY4lqVUjLGEvawZh18OMvBTBBHgQjlwnh3uod7EakfABUWzgstShMzy%2BZJ4cf%2BCipDC%2FkoqhBjqzAhe6beTPJ%2FWFn9AONSLorjUAwZNVRlFxdU7MMiIRZ%2FyNA%2FsmL9AUV%2FqjKVj9hK9kszDXQ6JJee3VZqApeoKEZkY7ZBpJWsffLy6IrB02OJ6zkaxVc%2FNJmv8EXTyVevUmTioAyhr2qpTpEp7BpbfJtvcG%2B0ilXNzU5KHQigq%2BTSQlvsdIl%2Bw3zcDHndusgyVmjohWXtSjTaGNbAi9%2FcGKKrfhjiwj9wi6tOBF61rtfLQb27Z80ZuPn2D6g2MpOkx9cXW9u1jBBxFs%2B81liLwsC7mdJfnWbxX5UDHZAERRzZEwWEKEEZnqfMblE43Jg1DerQ%2FemcXt6hECC5fuBQLwr3O58f8eyp%2F6KnbjIEVqZkPcP2G2QNfovmdEaN%2FxHWw0llhGkBzZNUEF82fv%2FmOuHftoRlk%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230328T063014Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIA6PAQHX6RC4ZMJKJI%2F20230328%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Signature=0d6bce14593bd6cf845dd5ee08f1174de3ec7d6a94b1fdd66fb5633d3355a7e3"
    }

    async function openCSV() {

        console.log("width: " + width)
        console.log("height: " + height)
        let response = await fetch(getS3Url())
        let data = await response.blob()
        let metadata = {
            type: 'text/csv'
        }
        let file = new File([data], "report.csv", metadata)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: false,
            complete: function (results) {
                console.log(results.data)
                const rowsArray = [];
                const valuesArray = [];

                // Iterating data to get column name and their values
                results.data.map((d) => {
                    // console.log(d)
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });

                // Parsed Data Response in array format
                setParsedData(results.data);

                // Filtered Column Names
                setTableRows(rowsArray[0]);

                // Filtered Values
                setValues(valuesArray);
            },
        })
        setOpenCsv(true)
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function onFileDownload(processId, documentId) {
        // await RequestAccessToken()
        console.log("Downloading...")
        if (documentId && !processId) {
            setErr("ProcessId cannot be empty when searching for documentId")
            return
        }
        let url;
        if (documentId) {
            console.log("Using documentId")
            url = window.BACKEND + "/ocr_process/" + processId + "/ocr_documents/" + documentId + "/download";
        } else {
            console.log("Not using documentId")
            url = window.BACKEND + "/ocr_process/" + processId + "/download";
        }
        console.log("URL: " + url)
        setIsLoading(true)
        await axios({
            method: "GET",
            url: url,
            validateStatus: () => true,
            headers: {
                "Authorization": "Bearer " + token,
                "accept": "application/json",
                "content-type": "application/json",
                "tenant-id": updatedTenant.current.length === 0 ? "DEMO" : updatedTenant.current
            }
        }).then(response => {
            console.log(response);
            if (response.status !== 200) {
                setErr(response.data.moreInformation)
                setIsLoading(false)
            } else {
                console.log(response.data)
                console.log("download url: " + response.data.downloadUrl)
                setDownloadUrl(response.data.downloadUrl);
                console.log("downloading file...")

                axios({
                    method: "GET",
                    url: response.data.downloadUrl,
                    responseType: 'blob'
                }).then((downloadResponse) => {
                    console.log("file ending: " + downloadResponse.headers["content-type"].split("/")[1])
                    let filename = documentId === null || documentId === "" ? processId : processId + "_" + documentId;
                    const href = URL.createObjectURL(downloadResponse.data)
                    const link = document.createElement('a')
                    link.href = href
                    link.setAttribute('download', filename + "." + downloadResponse.headers["content-type"].split("/")[1])
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(href)
                })
                setIsLoading(false)
            }
        }).catch(err => {
            console.log(err);
            setErr(err.message)
            setIsLoading(false)
        })
    }

    async function onCallSearch(processId, documentId, times) {
        if (documentId && !processId) {
            setErr("ProcessId cannot be empty when searching for documentId")
            return
        }
        if (times && times > 120) {
            setErr("After 120 retries the data could not be found.\nStatus check will be aborted")
            setIsLoading(false)
            setIsSearching(false)
            return;
        }
        if (times && times > 0) {
            await delay(2000);
        }
        setIsFetched(false);
        setErr('')
        if (!processId) {
            setErr("ProcessID cannot be empty")
            return;
        }
        setIsSearching(true);
        let url;
        if (documentId) {
            console.log("Using documentId")
            url = window.BACKEND + "/ocr_process/" + processId + "/ocr_documents/" + documentId + "?extended=" + updatedExtended.current;
        } else {
            console.log("Not using documentId")
            url = window.BACKEND + "/ocr_process/" + processId + "?extended=" + updatedExtended.current;
        }
        // await RequestAccessToken()
        console.log("URL: " + url)
        await axios({
            method: "GET",
            url: url,
            validateStatus: () => true,
            headers: {
                "Authorization": "Bearer " + token,
                "accept": "application/json",
                "content-type": "application/json",
                "verbose-option": debugSelected ? "DEBUG" : "NOT_DEBUG",
                "tenant-id": updatedTenant.current.length === 0 ? "Demo" : updatedTenant.current
            }
        }).then(response => {
            console.log(response)
            setProcessData(response);
            setIsOneDocumentRetreive(false)
            if (response.status === 400 || response.status === 401 || response.status === 500) {
                setErr(response.data.moreInformation)
                setIsFetched(false)
                setIsSearching(false);
                return;
            }
            if (response && response.data.documentStatus && (response.data.documentStatus === "COMPLETED" || response.data.documentStatus === "COMPLETED_WITH_ERROR" || response.data.documentStatus === "DEFERRED")) {
                console.log("found document")
                setIsOneDocumentRetreive(true)
                setIsFetched(true);
                setIsSearching(false);
                return;
            }
            if (!(response && response.data && response.data.processStatus && (response.data.processStatus === "COMPLETED" || response.data.processStatus === "COMPLETED_WITH_ERROR" || response.data.processStatus === "DEFERRED"))) {
                console.log("process not yet finished, searching again")
                setIsFetched(false)
                setIsSearching(true);
                onCallSearch(processId, documentId, times ? times + 1 : 1)
            } else {
                console.log("process finished")
                setIsFetched(true)
                setIsSearching(false);
                if (response.data.debugInfo && Object.keys(response.data.debugInfo).length > 0) {
                    console.log(response.data.debugInfo)
                    setVersionData(response.data.debugInfo)
                    setVersionPresent(true)
                } else {
                    console.log("debugInfo is missing")
                }
                console.log("version data: ")
                console.log(versionData)
            }
        }).catch(err => {
            console.log(err);
            console.log("err: " + err)
            console.log("err: " + err.response)
            console.log("err: " + err.message)
            setErr(err.message)
            setIsFetched(false)
            setIsSearching(false);
        })
    }

    const onClear = () => {
        setProcessData(null);
        setProcessId(null)
        setIsFetched(false)
        setErr('')
        setIsUploaded(false)
        setIsSearching(false)
    }

    function onFileUpload() {
        setIsLoading(false)
        console.log("uploading file")
        fetchUrl().then(async r => {
            // await RequestAccessToken()
            if (!r) {
                console.log("Signed URL not found")
                return;
            }
            console.log("fetch result:")
            console.log(r)
            setIsUploading(true)
            console.log("fetching done")
            console.log("Uploading file to " + r.replace(/^\s+|\s+$/g, ''))
            const config = {
                headers: {
                    'content-type': testFile.type,
                    'Authorization': token,
                    "tenant-id": updatedTenant.current.length === 0 ? "Demo" : updatedTenant.current
                }
            }
            axios.put(r.replace(/^\s+|\s+$/g), testFile, config).then(() => {
                console.log('success')
                setIsUploaded(true)
                setIsUploading(false)
                setIsFetched(false)
                console.log("file uploaded")
                console.log(r)
                const regex = new RegExp("([0-9a-z-]+)\\?");
                const match = regex.exec(r);
                console.log(match[1])
                onCallSearch(match[1])
            }).catch(err => {
                console.log("Error !!!")
                setIsUploaded(false)
                setIsUploading(false)
                setIsFetched(false)
                console.log(err);
                setErr(err)
            });
        })
    }

    async function fetchUrl() {
        console.log("fetching url")
        setVersionPresent(false);
        setErr("");
        setIsLoading(true);
        setIsFetched(false);
        setProcessId(null)
        // await RequestAccessToken()
        console.log("token in function: " + token)
        let url = window.BACKEND + "/ocr_process"
        console.log("url: " + url)
        try {
            let rawData = await axios({
                    method: "POST",
                    url: url,
                    validateStatus: () => true,
                    data: {
                        "additionalInfo": {
                            "deviceId": updatedDeviceId.current,
                            "requesterApplication": updatedRequester.current,
                        },
                        "debugInfo": {
                            "features": updatedFeatures.current,
                        },
                        "documentType": updatedDocumentType.current
                    },
                    headers: {
                        "content-type": "application/json",
                        "authorization": token,
                        "accept": "application/json",
                        "tenant-id": updatedTenant.current.length === 0 ? "Demo" : updatedTenant.current
                    }
                }
            );
            console.log(rawData)
            if (rawData.status === 400 || rawData.status === 401 || rawData.status === 500) {
                setErr(rawData.data.moreInformation)
                setIsLoading(false)
                return undefined;
            } else {
                console.log("url: ", rawData.data.uploadUrl)
                setProcessId(rawData.data.ocrProcessId)
                console.log(processId)
                setIsLoading(false);
                return rawData.data.uploadUrl;
            }
        } catch (err) {
            console.log(err)
            setErr(err.message);
            setIsLoading(false)
            return undefined;
        }
    }

    useEffect(() => {
        document.title = "Pexon OCR Demo " + window.STAGE + " Application";
        // RequestAccessToken()
    })

    const documentTypes = [
        {value: '', label: 'Undefined'},
        {
            type: 'group', name: 'ID Cards', items: [
                {value: 'CARD_ID:DE_CARD_ID', label: 'German ID Card'},
                {value: 'CARD_ID:OTHER', label: 'Other ID Card'},
            ]
        },
        {
            type: 'group', name: 'Passports', items: [
                {value: 'PASSPORT:GER_PASSPORT', label: 'German Passport'},
                {value: 'PASSPORT:TUR_PASSPORT', label: 'Turkish Passport - not implemented'},
                {value: 'PASSPORT:CHN_PASSPORT', label: 'Chinese Passport - not implemented'},
                {value: 'PASSPORT:ROM_PASSPORT', label: 'Romanian Passport - not implemented'},
            ]
        },
        {
            type: 'group', name: 'Bankcards', items: [
                {value: 'BANKCARD', label: 'Bankcard'},
            ]
        },
        {
            type: 'group', name: 'Pension Statements', items: [
                {value: 'PENSION_STATEMENT', label: 'Pension Statement'},
            ]
        },
    ]

    return (
        <Stack spacing={2} alignItems="center">

            <Popup
                trigger={<Button type="submit">System Info</Button>}>
                {() => (
                    <div>
                        {versionPresent ? (
                            <div>
                                <div>
                                    <h3>System Info</h3>
                                    <p><b>Frontend Version:</b> {version}</p>
                                    <p><b>Signed URL Function:</b> {versionData.signedurlversion}</p>
                                    <p><b>Preprocessing Function:</b> {versionData.preprocessingVersion}</p>
                                    <p><b>Processing Function:</b> {versionData.processingVersion}</p>
                                    <p><b>Status Function:</b> {versionData.statusVersion}</p>
                                </div>
                            </div>) : (
                            <div>
                                <div>
                                    <h3>System Info</h3>
                                    <p><b>Frontend Version:</b> {version}</p>
                                    <p><b>Signed URL Function:</b> {"call the service first"}</p>
                                    <p><b>Preprocessing Function:</b> {"call the service first"}</p>
                                    <p><b>Processing Function:</b> {"call the service first"}</p>
                                    <p><b>Status Function:</b> {"call the service first"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Popup>

            <CardContainer>
                <Card>
                    <CardContent>
                        <BannerContainer>
                            <BannerImage
                                src="https://pexon-consulting.de/wp-content/uploads/2022/03/PexonConsulting-59-min.png"></BannerImage>
                        </BannerContainer>
                        <BannerContent>
                            <Typography variant="h6">Pexon OCR Demo Application</Typography>
                        </BannerContent>

                        <Stack spacing={2}>

                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>Technical Information</Typography>

                                </AccordionSummary>

                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        {/*<TextField id="deviceId" label="Device Identification"*/}
                                        {/*           variant="standard"*/}
                                        {/*           name="deviceId" value={deviceId} onChange={handleDeviceId}/>*/}
                                        {/*<TextField id="extended" label="Get Debug Information" variant="standard"*/}
                                        {/*           name="extended" value={extended} onChange={handleExtended}/>*/}
                                        {/*<TextField id="requester" label="Requester Application"*/}
                                        {/*           variant="standard"*/}
                                        {/*           name="requester" value={requesterApplication}*/}
                                        {/*           onChange={handleRequester}/>*/}
                                        {/*<TextField id="documentType" label="Document Type" variant="standard"*/}
                                        {/*           name="documentType" value={documentType}*/}
                                        {/*           onChange={handleDocumentType}/>*/}

                                        <ReactDropdown options={documentTypes} value={documentType}
                                                       placeholder="Select Document Type" onChange={handleDocumentType}>
                                        </ReactDropdown>

                                        {/*<TextField id="tenant" label="Tenant-Id"*/}
                                        {/*           variant="standard" name="tenant"*/}
                                        {/*           value={tenant}*/}
                                        {/*           onChange={handleTenant}/>*/}
                                        {/*<TextField id="features" label="feature toggles"*/}
                                        {/*           variant="standard"*/}
                                        {/*           name="features" value={features} onChange={handleFeatures}/>*/}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                            <br/>
                            {err && <h2 style={{color: "red"}}>{err}</h2>}

                            <br></br>

                            <UploadContainer {...getRootProps({
                                accepted: +isDragAccept,
                                disabled
                            })}> <input type={"file"} max={1} {...getInputProps()} />
                                {(isLoading || isUploading) && <CircularProgress/>}
                                <p>Drop image here, or click to select files</p>
                            </UploadContainer>

                            {isUploaded && <h3 style={{color: "green"}}>Successfully uploaded file</h3>}

                            <br/>

                            <Stack direction="row" spacing={2}>
                                <TextField id="processId" label="Find process by process ID" variant="standard"
                                           name="processId" value={processId} onChange={handleProcessId}
                                           fullWidth/>
                                <TextField id="documentId" label="Filter by document ID" variant="standard"
                                           name="documentId" value={documentId} onChange={handleDocumentId}
                                           fullWidth/>
                                {isSearching && <CircularProgress style={{width: "40px"}}/>}
                            </Stack>
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Button variant="text" onClick={() => {
                            setDebugSelected(!debugSelected);
                        }
                        }> {debugSelected ? 'Debug On' : 'Debug Off'}
                        </Button>
                        <div onChange={onExtendedValue}>
                            <input type={"radio"} value="MIN" name="extended"/> Min
                            <input type={"radio"} value="MED" name="extended"/> Med
                            <input type={"radio"} value="MAX" name="extended"/> Max
                        </div>
                        {/*<Button variant="text" onClick={() => {*/}
                        {/*    setExtended(!extendedSelected);*/}
                        {/*}*/}
                        {/*}> {extendedSelected ? 'Extended On' : 'Extended Off'}*/}
                        {/*</Button>*/}
                        <Button type="submit" onClick={onSearch}>Search</Button>
                        <Button variant="submit" onClick={onDownload}>Download</Button>
                        {/*<Button type="submit" onClick={openCSV}>Open FSA Report</Button>*/}

                    </CardActions>
                </Card>
            </CardContainer>
            {
                isOpenCsv &&
                <NewWindow title={"FSA Report"} name={"FSA Report"} center={"screen"} copyStyles={true}
                           features={windowFeatures}>
                    <div>
                        <table border="1px solid black">
                            <thead>
                            <tr>
                                {tableRows.map((rows, index) => {
                                    return <th key={index}>{rows}</th>;
                                })}
                            </tr>
                            </thead>
                            <tbody>
                            {values.map((value, index) => {
                                return (
                                    <tr key={index}>
                                        {value.map((val, i) => {
                                            return <td key={i}>{val}</td>;
                                        })}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        <Button type="submit" onClick={() => setOpenCsv(false)}>Close</Button>
                    </div>
                </NewWindow>
            }

            {
                isFetched && <Stack style={{width: '90%'}}> <CardContainer><OCRResultTabs
                    data={isOneDocumentRetreive ? {
                        "processId": processId,
                        "documents": [processData.data]
                    } : processData.data} tenant={updatedTenant.current}></OCRResultTabs></CardContainer> </Stack>
            }

            <br/>

            {
                isFetched &&
                <Stack style={{width: '90%'}}>
                    <Typography variant="body">Debug Information</Typography>

                    <JSONTree shouldExpandNode={() => false} data={processData.data}/>
                </Stack>
            }
        </Stack>
    )
        ;
}

export default Content;
