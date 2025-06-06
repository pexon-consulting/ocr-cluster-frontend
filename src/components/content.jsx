import React, {useCallback, useEffect, useRef, useState} from 'react';
import {JSONTree} from 'react-json-tree';
import OCRResultTabs from "./ocrResultTab";
import axios from 'axios';
import UploadContainer, {BannerContainer, BannerContent, BannerImage, CardContainer} from '.././styles/banner';
import pexonImage from '.././assets/pexon_icon.png';
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
import {AwsClient} from "aws4fetch";


function Content() {

    const [processData, setProcessData] = useState({data: []});
    const [isUploaded, setIsUploaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isFetched, setIsFetched] = useState(false);
    const [isOneDocumentRetreive, setIsOneDocumentRetreive] = useState(false);
    const [versionPresent, setVersionPresent] = useState(false);
    const [err, setErr] = useState('');
    const [deviceId, setDeviceId] = useState();
    const [features, setFeatures] = useState();
    const [requesterApplication, setRequesterApplication] = useState();
    const [documentType, setDocumentType] = useState("");
    const [tenant, setTenant] = useState('');
    const [processId, setProcessId] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [debugSelected, setDebugSelected] = useState("true");
    const [accessKeyId, setAccessKeyId] = useState('')
    const updatedAccessKeyId = useRef(accessKeyId)
    const [secretAccessKey, setSecretAccessKey] = useState('')
    const updatedSecretAccessKey = useRef(secretAccessKey)
    const [extended, setExtended] = useState('MAX');
    const updatedDeviceId = useRef(deviceId);
    const updatedFeatures = useRef(features);
    const updatedRequester = useRef(requesterApplication);
    const updatedDocumentType = useRef(documentType);
    const updatedTenant = useRef(tenant);
    const updatedExtended = useRef(extended);
    const [versionData, setVersionData] = useState()

    let testFile: File;

    async function sendRequestToLambda(method, url, data, headers) {
        const aws = new AwsClient({
            accessKeyId: updatedAccessKeyId.current, secretAccessKey: updatedSecretAccessKey.current
        })

        console.log("url: " + url)
        console.log("method: " + method)
        console.log("data: " + JSON.stringify(data))
        console.log("headers: " + headers)

        const response = await aws.fetch(url, {
            method: method, headers: {
                "Content-Type": "application/json",
                "tenant-id": updatedTenant.current.length === 0 ? "ocr" : updatedTenant.current, ...headers
            }, ...(method !== "GET" && {body: JSON.stringify(data)})
        })
        return response.json()
    }

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
        onDrop, // maxFiles: 1
    });

    const handleAccessKeyId = event => {
        console.log(event.target.value)
        setAccessKeyId(() => {
            console.log("updating access key id: " + event.target.value)
            updatedAccessKeyId.current = event.target.value;
            return event.target.value
        })
    }

    const handleSecretAccessKey = event => {
        console.log(event.target.value)
        setSecretAccessKey(() => {
            console.log("updating secret access key: " + event.target.value)
            updatedSecretAccessKey.current = event.target.value;
            return event.target.value
        })
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

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function onFileDownload(processId, documentId) {
        console.log("Downloading...")
        if (documentId && !processId) {
            setErr("ProcessId cannot be empty when searching for documentId")
            return
        }
        let url;
        if (documentId) {
            console.log("Using documentId")
            url = "https://aczntrm5puua7xucuaczely4ti0hixgo.lambda-url.eu-central-1.on.aws/ocr_process/" + processId + "/ocr_documents/" + documentId + "/download";
        } else {
            console.log("Not using documentId")
            url = "https://aczntrm5puua7xucuaczely4ti0hixgo.lambda-url.eu-central-1.on.aws/ocr_process/" + processId + "/download";
        }
        console.log("URL: " + url)
        setIsLoading(true)

        try {
            let response = await sendRequestToLambda("GET", url);
            console.log("Response: " + response);
            console.log("download url: " + response.downloadUrl)
            setDownloadUrl(response.downloadUrl);
            console.log("downloading file...")
            axios({
                method: "GET", url: response.data.downloadUrl, responseType: 'blob'
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
        } catch (exception) {
            console.log(err);
            setErr(err.message)
            setIsLoading(false)
        }
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
            url = "https://3xujjmxprzwdp5m4dyjpbdmnle0jhqhg.lambda-url.eu-central-1.on.aws/ocr_process/" + processId + "/ocr_documents/" + documentId + "?extended=" + updatedExtended.current;
        } else {
            console.log("Not using documentId")
            url = "https://3xujjmxprzwdp5m4dyjpbdmnle0jhqhg.lambda-url.eu-central-1.on.aws/ocr_process/" + processId + "?extended=" + updatedExtended.current;
        }
        // await RequestAccessToken()
        console.log("URL: " + url)

        let headers = {
            "verbose-option": debugSelected ? "DEBUG" : "NOT_DEBUG",
        }

        let response = await sendRequestToLambda("GET", url, {}, headers)

        if (response && response.documentStatus && (response.documentStatus === "COMPLETED" || response.documentStatus === "COMPLETED_WITH_ERROR" || response.documentStatus === "DEFERRED")) {
            console.log("found document")
            setIsOneDocumentRetreive(true)
            setIsFetched(true);
            setIsSearching(false);
            return;
        }
        if (!(response && response.processStatus && (response.processStatus === "COMPLETED" || response.processStatus === "COMPLETED_WITH_ERROR" || response.processStatus === "DEFERRED"))) {
            console.log("process not yet finished, searching again")
            setIsFetched(false)
            setIsSearching(true);
            onCallSearch(processId, documentId, times ? times + 1 : 1)
        } else {
            console.log("process finished")
            setIsFetched(true)
            setIsSearching(false);
            setProcessData(response);
            setIsOneDocumentRetreive(false)
            if (response.debugInfo && Object.keys(response.debugInfo).length > 0) {
                console.log(response.debugInfo)
                setVersionData(response.debugInfo)
                setVersionPresent(true)
            } else {
                console.log("debugInfo is missing")
            }
            console.log("version data: ")
            console.log(versionData)
        }
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
            if (!r) {
                console.log("Signed URL not found")
                return;
            }
            console.log("fetch result:")
            console.log(r)
            setIsUploading(true)
            console.log("fetching done")
            console.log("Uploading file to " + r)
            axios.put(r, testFile).then(() => {
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
        let url = "https://z5lvulli5tvwdpmem5j2u7vlaa0hkryt.lambda-url.eu-central-1.on.aws/"
        console.log("url: " + url)
        try {
            let response = await sendRequestToLambda("POST", url, {
                "debugInfo": {
                    "features": updatedFeatures.current,
                }, "documentType": updatedDocumentType.current
            })
            console.log("signed url response:")
            console.log(response.uploadUrl)
            console.log("url: ", response.uploadUrl)
            setProcessId(response.ocrProcessId)
            console.log(processId)
            setIsLoading(false);
            return response.uploadUrl;
            // }
        } catch (err) {
            console.log(err)
            setErr(err.message);
            setIsLoading(false)
            return undefined;
        }
    }

    useEffect(() => {
        document.title = "Pexon OCR Demo";
    })

    const documentTypes = [{value: '', label: 'Undefined'}, {
        type: 'group', name: 'ID Cards', items: [{value: 'CARD_ID:DE_CARD_ID', label: 'German ID Card'}, {
            value: 'CARD_ID:OTHER', label: 'Other ID Card'
        },]
    }, {
        type: 'group', name: 'Passports', items: [{value: 'PASSPORT:GER_PASSPORT', label: 'German Passport'}, {
            value: 'PASSPORT:TUR_PASSPORT', label: 'Turkish Passport - not implemented'
        }, {
            value: 'PASSPORT:CHN_PASSPORT', label: 'Chinese Passport - not implemented'
        }, {value: 'PASSPORT:ROM_PASSPORT', label: 'Romanian Passport - not implemented'},]
    }, {
        type: 'group', name: 'Bankcards', items: [{value: 'BANKCARD', label: 'Bankcard'},]
    }, {
        type: 'group', name: 'Pension Statements', items: [{value: 'PENSION_STATEMENT', label: 'Pension Statement'},]
    },]

    return (<Stack spacing={2} alignItems="center">
        <CardContainer>
            <Card>
                <CardContent>
                    <BannerContainer>
                        <BannerImage
                            src={pexonImage}></BannerImage>
                    </BannerContainer>
                    <BannerContent>
                        <Typography variant="h6">Pexon OCR Demo</Typography>
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
                                    <TextField id="accessKeyId" label="Access Key Id" type="password"
                                               variant="standard"
                                               name="accessKeyId" value={accessKeyId} onChange={handleAccessKeyId}/>
                                    <TextField id="secretAccessKey" label="Secret Access Key" type="password"
                                               variant="standard"
                                               name="secretAccessKey" value={secretAccessKey}
                                               onChange={handleSecretAccessKey}/>
                                    {/*<ReactDropdown options={documentTypes} value={documentType}*/}
                                    {/*               placeholder="Select Document Type" onChange={handleDocumentType}>*/}
                                    {/*</ReactDropdown>*/}

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
                            accepted: +isDragAccept, disabled
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
                            {isSearching && <CircularProgress sx={
                                {
                                    animation: 'none',
                                    margin: 'auto',
                                }
                            }/>}
                        </Stack>
                    </Stack>
                </CardContent>
                <CardActions>
                    {/*<Button variant="text" onClick={() => {*/}
                    {/*    setDebugSelected(!debugSelected);*/}
                    {/*}}> {debugSelected ? 'Debug On' : 'Debug Off'}*/}
                    {/*</Button>*/}
                    {/*<div onChange={onExtendedValue}>*/}
                    {/*    <input type={"radio"} value="MIN" name="extended"/> Min*/}
                    {/*    <input type={"radio"} value="MED" name="extended"/> Med*/}
                    {/*    <input type={"radio"} value="MAX" name="extended"/> Max*/}
                    {/*</div>*/}
                    {/*<Button variant="text" onClick={() => {*/}
                    {/*    setExtended(!extendedSelected);*/}
                    {/*}*/}
                    {/*}> {extendedSelected ? 'Extended On' : 'Extended Off'}*/}
                    {/*</Button>*/}
                    <Button type="submit" onClick={onSearch}>Search</Button>
                    {/*<Button variant="submit" onClick={onDownload}>Download</Button>*/}
                    {/*<Button type="submit" onClick={openCSV}>Open FSA Report</Button>*/}

                </CardActions>
            </Card>
        </CardContainer>

        {isFetched && <Stack style={{width: '90%'}}> <CardContainer><OCRResultTabs
            data={isOneDocumentRetreive ? {
                "processId": processId, "documents": [processData]
            } : processData} tenant={updatedTenant.current} authenticateLambda={sendRequestToLambda}>

        </OCRResultTabs></CardContainer> </Stack>}

        <br/>

        {isFetched && <Stack style={{width: '90%'}}>
            <Typography variant="body">Debug Information</Typography>

            <JSONTree shouldExpandNode={() => false} data={processData}/>
        </Stack>}
    </Stack>);
}

export default Content;
