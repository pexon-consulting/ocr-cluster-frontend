import {Box, Container} from "@mui/material";
import {styled} from "@mui/material/styles";
import {grey} from "@mui/material/colors";

export const BannerContainer = styled(Box)(({matches, theme}) => ({
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: "0px 0px",
    paddingTop: '30px',

    // backgroundImage: `url(/images/banner/banner.png)`,
    // backgroundRepeat: "no-repeat",
    // backgroundPosition: "center",
}));

export const TabsContainer = styled(Box)(({matches, theme}) => ({
    display: "flex",
    justifyContent: "left",
    width: "90%",
    height: "100%",
    padding: "10px 10px",
    paddingTop: '30px',

    // backgroundImage: `url(/images/banner/banner.png)`,
    // backgroundRepeat: "no-repeat",
    // backgroundPosition: "center",
}));

export const BannerContent = styled(Box)(() => ({
    display: "flex",
    justifyContent: "center",
    padding: "30px",
}));

export const BannerImage = styled("img")(({src, theme}) => ({
    src: `url(${src})`,
    // backgroundImage: `url(${src})`,
    // backgroundRepeat: "no-repeat",
    // backgroundPosition: "center",
    width: "100px",
    height: "100px",
}));

export const CardContainer = styled(Container)(() => ({
    display: "flex",
    justifyContent: "center",
    maxWidth: "sm",
    padding: "30px",
}));

const UploadContainer = styled("div")(
    ({theme, accepted, disabled}) => {
        const getColor = () => {
            switch (true) {
                case Boolean(accepted):
                    return theme.palette.success.main;
                case disabled:
                    return grey[600];
                default:
                    return theme.palette.primary.main;
            }
        };
        return {
            color: getColor(),
            borderColor: getColor(),
            cursor: disabled ? "default" : "pointer",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            borderWidth: "2px",
            borderRadius: "2px",
            borderStyle: "dashed",
            outline: "none",
            transition: "border 0.24s ease-in-out"
        };
    }
);

export default UploadContainer;