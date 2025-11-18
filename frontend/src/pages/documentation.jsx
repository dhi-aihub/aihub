import { Button, Container, CssBaseline, Divider, Typography } from "@mui/material";

const Documentation = () => {
  return (
    <>
      <Container component="main" maxWidth="lg">
        <CssBaseline />

        {/* Title & Intro */}
        <Typography variant="h4" gutterBottom>
          AiHub Microservices – Deployment Guide
        </Typography>
        <Typography variant="body1" gutterBottom>
          This page documents how to run the AiHub microservices locally using Docker Compose, and
          how to deploy them to a Kubernetes cluster using <code>kubectl</code>.
        </Typography>

        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />

        {/* Project structure */}
        <Typography variant="h5" gutterBottom>
          1. Project structure
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`services/
  users-service/
    compose.yaml
    k8s.yaml
  catalogue-service/
    compose.yaml
    k8s.yaml
  file-service/
    compose.yaml
    k8s.yaml
  results-service/
    compose.yaml
    k8s.yaml
  scheduler-service/
    compose.yaml
    k8s.yaml
  api-gateway/
    compose.yaml
    k8s.yaml`}
        </Typography>

        {/* Prerequisites */}
        <Typography variant="h5" gutterBottom>
          2. Prerequisites
        </Typography>
        <Typography variant="body1" gutterBottom>
          Before running any service, ensure that:
        </Typography>
        <Typography component="ul" variant="body1" sx={{ pl: 4, mb: 2 }}>
          <li>Docker and Docker Compose are installed and running.</li>
          <li>
            Kubernetes CLI (<code>kubectl</code>) is installed.
          </li>
          <li>You have access to a Kubernetes cluster (local or remote) for deployment.</li>
          <li>
            Any required environment variables (e.g. database URLs, JWT secrets) are defined in your{" "}
            <code>.env</code> files or in the respective YAML files.
          </li>
        </Typography>

        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />

        {/* Local development with Docker */}
        <Typography variant="h5" gutterBottom>
          3. Running services locally with Docker Compose
        </Typography>

        <Typography variant="h6" gutterBottom>
          3.1 Running a single service
        </Typography>
        <Typography variant="body1" gutterBottom>
          Each service has its own <code>compose.yaml</code>. To run a single microservice (for
          example, the <code>users-service</code>), navigate into its directory and start Docker
          Compose:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`cd services/users-service
docker compose up --build`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          This will build the image (if needed) and start the containers defined in that
          service&apos;s
          <code> compose.yaml</code>. Logs will appear in the same terminal.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          3.2 Running multiple services
        </Typography>
        <Typography variant="body1" gutterBottom>
          For a typical local setup, you may want to run all core services (e.g.
          <code> users-service</code>, <code>catalogue-service</code>, <code>file-service</code>,{" "}
          <code>results-service</code>, <code>scheduler-service</code>, and <code>api-gateway</code>
          ). Open a separate terminal for each service and run:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`cd services/users-service
docker compose up --build

cd services/catalogue-service
docker compose up --build

cd services/file-service
docker compose up --build

# ...repeat for the remaining services
cd services/api-gateway
docker compose up --build`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Once all services are running, you can access the platform via the{" "}
          <code>api-gateway</code> (or whichever service exposes the frontend/API) on the port
          defined in its <code>compose.yaml</code>.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          3.3 Stopping services
        </Typography>
        <Typography variant="body1" gutterBottom>
          To stop a service, go to the respective terminal and press <code>Ctrl + C</code>. To
          remove containers and networks created by a service:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`# From inside a service directory
docker compose down`}
        </Typography>

        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />

        {/* Kubernetes deployment */}
        <Typography variant="h5" gutterBottom>
          4. Deploying to Kubernetes
        </Typography>

        <Typography variant="h6" gutterBottom>
          4.1 Set Kubernetes context and namespace
        </Typography>
        <Typography variant="body1" gutterBottom>
          Ensure <code>kubectl</code> is pointing to the correct cluster and (optionally) create a
          dedicated namespace for AiHub:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`# Check current context
kubectl config current-context

# (Optional) create and use a namespace
kubectl create namespace aihub
kubectl config set-context --current --namespace=aihub`}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          4.2 Apply manifests for each service
        </Typography>
        <Typography variant="body1" gutterBottom>
          Each service has a <code>k8s.yaml</code> file describing its Deployments, Services and (if
          configured) related resources. To deploy a single service:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`cd services/users-service
kubectl apply -f k8s.yaml`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Repeat this for each microservice:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`cd services/catalogue-service
kubectl apply -f k8s.yaml

cd services/file-service
kubectl apply -f k8s.yaml

# ...repeat for remaining services
cd services/api-gateway
kubectl apply -f k8s.yaml`}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          4.3 Verifying the deployment
        </Typography>
        <Typography variant="body1" gutterBottom>
          Check that all pods and services are running:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`kubectl get pods
kubectl get svc`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          If you are using an Ingress (for example, pointing to the <code>api-gateway</code>), apply
          the Ingress manifest and then access the platform via the configured host or IP address.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          4.4 Updating services
        </Typography>
        <Typography variant="body1" gutterBottom>
          When you push a new container image (e.g. with a new tag), update the image reference in
          the corresponding <code>k8s.yaml</code> and re-apply:
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            bgcolor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          {`kubectl apply -f k8s.yaml

# Optionally watch rollout status
kubectl rollout status deployment/users-service`}
        </Typography>

        <Divider sx={{ marginTop: 2, marginBottom: 2 }} />

        {/* Optional external docs link */}
        <Typography variant="body1" gutterBottom>
          For more detailed architecture diagrams or service-specific configuration, refer to the
          full project documentation.
        </Typography>
        <Button
          variant="outlined"
          href="https://edu-ai.github.io/aivle-docs/"
          target="_blank"
          sx={{ mt: 1, mb: 4 }}
        >
          Open Full Documentation
        </Button>
      </Container>
    </>
  );
};

export default Documentation;
