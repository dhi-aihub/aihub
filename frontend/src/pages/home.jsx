import { Button, Container, CssBaseline, Divider, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          Welcome to AiHub!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Login first, then open the drawer by pressing the top left corner button. Enjoy~
        </Typography>
        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
        <Button variant="outlined" component={RouterLink} to="/documentation">
          Documentation
        </Button>
      </Container>
    </>
  );
};

export default Home;
