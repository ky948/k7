# Wasmer Edge Deployment Runbook

Deploy the KY7 web application to **Wasmer Edge** using GitHub Actions and the Wasmer WebAssembly edge platform.

---

## 1. Prerequisites

1. **Wasmer Account**: Sign up or log in at [wasmer.io](https://wasmer.io).
2. **Wasmer Token**:
   - Go to your Wasmer dashboard: [wasmer.io/settings/tokens](https://wasmer.io/settings/tokens).
   - Click **Create Token**.
   - Copy the token string.

---

## 2. Configure GitHub Secrets

1. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name: `WASMER_TOKEN`
4. Secret: Paste your Wasmer token.
5. Click **Add secret**.

---

## 3. Deployment Flow

The repository includes:
- **`wasmer.toml`**: Configures the Wasmer package using `wasmer/static-web-server` to serve the SPA `dist/` bundle with fallback routing.
- **`app.yaml`**: Configures the Wasmer Edge App name and package linkage.
- **`.github/workflows/deploy-wasmer.yml`**: GitHub Actions workflow that:
  1. Checks out the repository.
  2. Installs dependencies and builds the application (`npm run build`).
  3. Installs Wasmer CLI via `wasmerio/setup-wasmer@v2`.
  4. Deploys directly to Wasmer Edge using `wasmer deploy`.

When you push code to the `main` branch, GitHub Actions will automatically deploy the web app to Wasmer Edge, providing a globally distributed URL (e.g. `https://<your-app>.wasmer.app`).

---

## 4. Decommissioning AWS Resources

To avoid ongoing AWS charges, clean up any previous EC2 resources:
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2).
2. Click **Instances** in the left sidebar.
3. Select `ky7-trading-server`.
4. Click **Instance state** > **Terminate instance**.
5. Go to **Network & Security** > **Elastic IPs**; if any Elastic IP is allocated, click **Actions** > **Release Elastic IP addresses**.
