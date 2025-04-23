import React, {useLayoutEffect, useState} from 'react'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Tabs,
    Typography
} from '@mui/material';
import Popup from 'reactjs-popup';
import PropTypes from 'prop-types';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PassportIcon from '@mui/icons-material/Public'
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import NotesIcon from '@mui/icons-material/Notes';
import GarageIcon from '@mui/icons-material/Garage';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PaidIcon from '@mui/icons-material/Paid';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {TabsContainer} from '../styles/banner';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import properties from "../config/properties.json";
import {loginRequest} from "../authConfig";
import {useMsal} from "@azure/msal-react";
import {Article} from "@mui/icons-material";

function OCRResultTabs(props) {
    let {data, tenant, authenticateLambda} = props;

    const {instance, accounts, inProgress} = useMsal();

    let token = ""

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
    //     console.log("name logged in: " + accounts[0].name)
    //     console.log("idToken logged in: " + accounts[0].idToken)
    //
    //     let tokenResponse = await instance.handleRedirectPromise();
    //     //console.log("tokenResponse.accessToken: " + tokenResponse.accessToken)
    //
    //     let accountObject;
    //     if (tokenResponse) {
    //         accountObject = tokenResponse.account;
    //     } else {
    //         accountObject = instance.getAllAccounts()[0];
    //     }
    //     try {
    //         if (accountObject && tokenResponse) {
    //             console.log("got valid accountObject and tokenResponse")
    //         } else if (accountObject) {
    //             console.log("user logged in but no tokens")
    //             try {
    //                 tokenResponse = await instance.acquireTokenSilent({
    //                     account: accountObject, scopes: loginRequest.scopes
    //                 });
    //             } catch (err) {
    //                 await instance.acquireTokenRedirect(loginRequest)
    //             }
    //         } else {
    //             console.log("no accountObject or tokenResponse")
    //             await instance.loginRedirect(loginRequest)
    //         }
    //     } catch (err) {
    //         console.error(err)
    //     }
    //     console.log(tokenResponse.accessToken)
    //     console.log("token response:")
    //     console.log(tokenResponse)
    //     token = tokenResponse.idToken
    //     if (token === undefined) {
    //         console.log("redirecting to logout")
    //         logout()
    //     }
    //
    //     console.log("token set: " + token)
    // }

    const [value, setValue] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [imageUrlToLoad, setImageUrlToLoad] = useState([]);
    const [tmpLoaded, setTmpLoaded] = useState(1);
    const [imgComponentHeight, setImgComponentHeight] = useState(false);
    const [imgComponentWidth, setImgComponentWidth] = useState(false);
    const [size, setSize] = useState([0, 0]);


    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const getStripedStyle = (index) => {
        return {background: index % 2 ? '#fafafa' : 'white'};
    }

    const getId = (prefix, index) => {
        return prefix + index;
    }

    const getIdRandom = (prefix, index) => {
        return prefix + Math.floor(Math.random() * 100) + index;
    }

    const isStatusWaiting = (status) => {
        return status !== "COMPLETED" && status !== "ERROR";
    }

    const getTextByType = (type1, subtype, labels) => {
        if (type1 === "CARD_ID") {
            if (subtype === "DE_CARD_ID") {
                return "Deutscher Personalausweis";
            } else {
                return "Ausweis (" + subtype + ")";
            }
        }
        if (type1 === "PASSPORT") {
            if (subtype === "DE_PASSPORT") {
                return "Deutscher Reisepass"
            } else {
                return "Reisepass (" + subtype + ")"
            }
        }
        if (type1 === "CAR_REGISTRATION") {
            return "KFZ Zulassungsbescheinigung Teil II"
        }
        if (type1 === "PAYSLIP") {
            return "Gehaltsnachweis"
        }
        if (type1 === "UNCLASSIFIED") {
            return "Unklassifiziert";
        }
        let result = type1 + " - " + subtype
        if (labels != null && labels.length >= 2) {
            try {
                labels = Array.from(labels.matchAll(/\(([a-zA-Z]*]*),([ 0-9,.]*)\)/gm));
                if (labels != null && labels.length >= 2) {
                    result += " - " + labels[0][0] + " / " + labels[1][0]
                }
            } catch (error) {
            }
        }
        return result;
    }

    const getIconByType = (type1, subtype) => {
        if (type1 === "CARD_ID") {
            return (<Stack direction="row" spacing={1}><RecentActorsIcon></RecentActorsIcon>
                {subtype === "DE_CARD_ID" && <TaskAltIcon></TaskAltIcon>} </Stack>);
        }
        if (type1 === "FSA_FORM") {
            return (<ListAltIcon></ListAltIcon>);
        }
        if (type1 === "PAYSLIP") {
            return (<RequestQuoteIcon></RequestQuoteIcon>);
        }
        if (type1 === "PASSPORT") {
            return (<PassportIcon></PassportIcon>)
        }
        if (type1 === "BANKCARD") {
            return (<CreditCardIcon></CreditCardIcon>)
        }
        if (type1 === "PENSION_STATEMENT") {
            return (<NotesIcon></NotesIcon>)
        }
        if (type1 === "CAR_REGISTRATION") {
            return (<GarageIcon></GarageIcon>)
        }
        if (type1 === "PAYSLIP") {
            return (<PaidIcon></PaidIcon>)
        }
        if (type1 === "INSURANCE") {
            return (<Article></Article>)
        }
        if (type1 === "ACCOUNT_STATEMENT") {
            return (<Article></Article>)
        }
        if (type1 === "MOBILITY_LOAN_CONTRACT") {
            return (<Article></Article>)
        }
        if (type1 === "MOBILITY_LOAN_CONTRACTS") {
            return (<Article></Article>)
        }
        if (type1 === "ACCEPTANCE_DECLARATION") {
            return (<Article></Article>)
        }
        if (type1 === "RESIDENCE_PERMIT") {
            return (<Stack direction="row" spacing={1}><RecentActorsIcon></RecentActorsIcon>
                {/*{subtype === "DE_CARD_ID" && <TaskAltIcon></TaskAltIcon>} */}
            </Stack>);
        }
        if (type1 === "THIRD_PARTY_DECLARATION") {
            return (<Article></Article>)
        }
        return (<DeviceUnknownIcon></DeviceUnknownIcon>);
    }

    const getValueRender = (value) => {
        if (value) {
            if (value.toLowerCase() === "true") return (<CheckBoxIcon></CheckBoxIcon>)
            if (value.toLowerCase() === "false") return (<CheckBoxOutlineBlankIcon></CheckBoxOutlineBlankIcon>)
        }
        return value;

    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    let docuTabs = data.documents ? data.documents.map((document, index) => {
        let title = "Page " + (index + 1);
        return (
            <Tab key={getId("tabId", index)} label={title} {...a11yProps(1)} />
        )
    }) : ""

    // https://aczntrm5puua7xucuaczely4ti0hixgo.lambda-url.eu-central-1.on.aws/
    async function getDownloadUrlImage(index, processId, documentId) {
        let tmpImageUrlToLoad = resizeArr(imageUrlToLoad, index + 1, null)
        setLoaded(false)
        if (tmpImageUrlToLoad[index] !== null && tmpImageUrlToLoad[index] !== "") {
            return;
        }
        let url = "https://aczntrm5puua7xucuaczely4ti0hixgo.lambda-url.eu-central-1.on.aws/ocr_process/" + processId + "/ocr_documents/" + documentId + "/download";

        let response = await authenticateLambda("GET", url)
        if (response !== null) {
            console.log(response)
            let tmpImageUrlToLoad = resizeArr(imageUrlToLoad, index + 1, null)
            tmpImageUrlToLoad[index] = response.downloadUrl
            setImageUrlToLoad(tmpImageUrlToLoad)
            setTmpLoaded(Math.floor(Math.random() * 100) + 2)
        } else {
            console.log("Error");
            let tmpImageUrlToLoad = resizeArr(imageUrlToLoad, index + 1, null)
            tmpImageUrlToLoad[index] = "";
            setImageUrlToLoad(tmpImageUrlToLoad)
            setTmpLoaded(Math.floor(Math.random() * 100) + 2)
        }
        // await axios({
        //     method: "GET",
        //     url: url,
        //     validateStatus: () => true,
        //     headers: {
        //         "Authorization": "Bearer " + token,
        //         "accept": "application/json",
        //         "content-type": "application/json",
        //         "santander-tenant-id": tenant
        //     }
        // }).then(response => {
        //     console.log(response);
        //     let tmpImageUrlToLoad = resizeArr(imageUrlToLoad, index + 1, null)
        //     if (response.status !== 200) {
        //         tmpImageUrlToLoad[index] = "";
        //     } else {
        //         tmpImageUrlToLoad[index] = response.data.downloadUrl
        //     }
        //     setImageUrlToLoad(tmpImageUrlToLoad)
        //     setTmpLoaded(Math.floor(Math.random() * 100) + 2)
        // }).catch(err => {
        //     console.log(err);
        //     let tmpImageUrlToLoad = resizeArr(imageUrlToLoad, index + 1, null)
        //     tmpImageUrlToLoad[index] = "";
        //     setImageUrlToLoad(tmpImageUrlToLoad)
        //     setTmpLoaded(Math.floor(Math.random() * 100) + 2)
        // })
    }

    async function onViewImageClick(index) {
        getDownloadUrlImage(index, data.processId, data.documents[index].documentId)
    }

    function resizeArr(arr, newSize, defaultValue) {
        if (arr === null) arr = [];
        while (newSize > arr.length)
            arr.push(defaultValue);
        return arr;
    }

    let docuTabPanels = data.documents ? data.documents.map((document, index) => {
        const getRectPosition = (top, left, width, height) => {
            return {
                left: imgComponentWidth * left,
                top: top * imgComponentHeight,
                width: imgComponentWidth * width,
                height: height * imgComponentHeight
            };
        }
        const onImageLoaded = ({target: img}) => {
            setImgComponentHeight(img.offsetHeight)
            setImgComponentWidth(img.offsetWidth)
            setLoaded(true)
        }
        if (!document) return "";
        return (
            <TabPanel key={getId("tabIdPanel", index)} value={value} index={index}>
                <Stack>

                    <Popup
                        key={getId("tabIdPopup", index)}
                        onOpen={() => onViewImageClick(index)}
                        trigger={<Button type="submit">View Image</Button>}
                        modal
                        nested
                    >
                        {close => (
                            <div className="modal" key={getId("div001", index)}>
                                <div className="header" key={getId("div002", index)}></div>
                                <div className="content" key={getId("div003", index)}>
                                    <div id="img-container" key={getId("div004", index)} style={{
                                        maxHeight: size[1] * 7 / 10,
                                        minHeight: 200,
                                        overflow: 'auto',
                                        position: 'relative'
                                    }}>
                                        {loaded ?
                                            document.documentData.map((row, index2) => (
                                                <div key={getId("div005", (index * index2) + index2)}>
                                                    <Tooltip key={getId("tooltip1", index)} title={<div style={{
                                                        fontSize: '1.5em',
                                                        color: "lightblue"
                                                    }}>{row.fieldName}</div>} placement="top-start">
                                                        <div key={getId("rectangle1", index)} style={{
                                                            position: 'absolute', ...getRectPosition(row.keyBoundingBox.top, row.keyBoundingBox.left, row.keyBoundingBox.width, row.keyBoundingBox.height),
                                                            background: 'blue',
                                                            opacity: 0.25
                                                        }}></div>
                                                    </Tooltip>

                                                    <Tooltip key={getId("tooltip2", index)} title={<div
                                                        style={{fontSize: '2.0em', color: "lightblue"}}>{row.value}<br/><small>{row.confidence + "%"}</small>
                                                    </div>}
                                                             placement="top-start">
                                                        <div key={getId("rectangle2", index)} style={{
                                                            position: 'absolute', ...getRectPosition(row.valueBoundingBox.top, row.valueBoundingBox.left, row.valueBoundingBox.width, row.valueBoundingBox.height),
                                                            background: 'green',
                                                            opacity: 0.25
                                                        }}></div>
                                                    </Tooltip>
                                                </div>
                                            )) : null
                                        }
                                        {(tmpLoaded > 0 && imageUrlToLoad != null && imageUrlToLoad.length > index && imageUrlToLoad[index] !== null && imageUrlToLoad[index] !== "") ?
                                            <img key={getId("imageShowData", index)} src={imageUrlToLoad[index]}
                                                 style={{maxWidth: (size[0] * 6 / 10)}} alt="image not found"
                                                 onLoad={onImageLoaded}/> :
                                            <div key={getId("div006", index)} style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 180
                                            }}>
                                                <CircularProgress key={getId("process001", index)}
                                                                  style={{width: "40px"}}/>
                                            </div>}
                                    </div>
                                </div>
                                <div className="actions">
                                </div>
                            </div>
                        )}
                    </Popup>


                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 100}} aria-label="simple table">
                            <TableBody>
                                <TableRow key={getId("a1", index)}>
                                    <TableCell component="th" scope="row">Status</TableCell>
                                    <TableCell component="th" scope="row"></TableCell>
                                    <TableCell align="right"><Chip label={document.documentStatus} variant="outlined"/>
                                    </TableCell>
                                </TableRow>
                                {document.classification &&
                                    <TableRow key={getId("a2", index)}>
                                        <TableCell component="th" scope="row">

                                            {document.debugInfo ?
                                                <Typography
                                                    sx={{fontWeight: 'bold'}}> {getTextByType(document.classification.documentType, document.classification.documentSubType, document.debugInfo.label)} </Typography> :
                                                <Typography
                                                    sx={{fontWeight: 'bold'}}> {getTextByType(document.classification.documentType, document.classification.documentSubType, null)} </Typography>
                                            }

                                        </TableCell>
                                        <TableCell component="th" scope="row"
                                                   align="right"><Box></Box> {getIconByType(document.classification.documentType, document.classification.documentSubType)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip label={document.classification.confidence} variant="outlined"/>
                                        </TableCell>
                                    </TableRow>
                                }
                                {document.classification &&
                                    <TableRow key={getId("a3", index)}>
                                        <TableCell component="th" scope="row">Location</TableCell>
                                        <TableCell component="th" scope="row"></TableCell>
                                        <TableCell align="right"><Chip label={document.documentLocationPage}
                                                                       variant="outlined"/> </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        {isStatusWaiting(document.documentStatus) &&
                            <Box align="center" style={{height: "100px", width: "100%", justifyContent: "center"}}>
                                <CircularProgress style={{width: "40px"}}/> </Box>}
                    </TableContainer>

                    <br/>
                    {document.documentData &&
                        <Box sx={{overflow: "auto"}}>
                            <Box sx={{width: "100%", display: "table", tableLayout: "fixed"}}>
                                <Table sx={{minWidth: 200}}>

                                    <TableBody>
                                        {document.documentData.map((row, index2) => (
                                            <TableRow key={getIdRandom(row.fieldName, index)}
                                                      sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                                      style={{
                                                          padding: '2px 8px',
                                                          height: 25, ...getStripedStyle(index2)
                                                      }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Typography sx={{
                                                        textTransform: 'capitalize',
                                                        fontWeight: 'bold'
                                                    }}> {row.fieldName} </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="right"><Typography> {getValueRender(row.value)} </Typography>
                                                </TableCell>
                                                <TableCell align="right"><Typography
                                                    sx={{fontStyle: 'italic'}}> {row.confidence}% </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>
                    }
                </Stack>
            </TabPanel>
        )
    }) : ""

    return (
        <div>
            <TabsContainer>
                <Stack>
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        maxWidth: {xs: 320, sm: 600, md: 900, lg: 1200},
                        bgcolor: 'background.paper'
                    }}>
                        <Tabs value={value} onChange={handleChange} aria-label="scrollable force basic tabs"
                              variant="scrollable" scrollButtons allowScrollButtonsMobile>
                            {docuTabs}
                        </Tabs>
                        {docuTabPanels}
                    </Box>
                </Stack>
            </TabsContainer>
        </div>
    );
}


function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

export default OCRResultTabs;