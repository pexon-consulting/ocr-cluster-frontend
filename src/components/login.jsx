import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";
import { useMsal } from "@azure/msal-react";
// import { msalConfig } from "../authConfig";
import { loginRequest } from "../authConfig";
import { Stack } from "react-bootstrap";
import { CardContainer } from "../styles/banner";

export const Login = () => {
    const { instance, accounts, inProgress } = useMsal(msalConfig);
    sessionStorage.clear()

    if (inProgress === "login") {
        console.log("logging in ...")
        return <span>Login is currently in progress</span>
    } else {
        console.log("not logged in")
        return (            
            <Stack spacing={2} alignItems="center">
                <br/>
                <br/>
                <CardContainer>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">Pexon OCR Demo</Typography>
                            <br/>
                            <Typography variant="h6">Please login into the application</Typography>
                            <br/>
                        </CardContent>
                        <CardActions>
                            <Button mat-raised-button style={{backgroundColor: "#e0ecff"}} onClick={() => instance.loginRedirect(loginRequest)}>Sign in to the Pexon OCR Demo {window.STAGE}</Button>
                        </CardActions>
                    </Card>
                </CardContainer>
            </Stack>
        )
    }
}
export default Login;