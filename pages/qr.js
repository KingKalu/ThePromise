import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import { getBranches } from "@/lib/api";

export default function QRPage() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [tableCode, setTableCode] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const loadedBranches = await getBranches();
        setBranches(loadedBranches);
        setBranchId(loadedBranches[0]?.id || "");
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  function handleStart() {
    if (!branchId) return;
    const table = tableCode || "TBL-001";
    window.location.href = `/order?mode=dine-in&table=${encodeURIComponent(
      table,
    )}&branch=${encodeURIComponent(branchId)}`;
  }

  return (
    <>
      <Head>
        <title>QR Table Ordering | The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Simulated QR ordering flow connecting a table identity to the digital ordering journey."
        />
      </Head>
      <AppShell footerText="QR ordering demo | From table scan to branch-aware order routing.">
        <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5.5 } }}>
          <Grid container spacing={2.2}>
            <Grid size={{ xs: 12, md: 6.5 }}>
              <Card>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography variant="h5" sx={{ mb: 1.5 }}>
                    QR Table Ordering Flow
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.2 }}>
                    In production, each table has a unique QR code. This demo simulates the same journey in a controlled environment.
                  </Typography>
                  <Stack spacing={1.3}>
                    <TextField
                      size="small"
                      label="Table Code"
                      placeholder="TBL-A12"
                      value={tableCode}
                      onChange={(event) => setTableCode(event.target.value)}
                    />
                    <TextField
                      size="small"
                      select
                      label="Branch"
                      value={branchId}
                      onChange={(event) => setBranchId(event.target.value)}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button variant="contained" onClick={handleStart}>
                      Start Dine-In Order
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5.5 }}>
              <Card className="h-full bg-gradient-to-br from-amber-100 to-orange-100">
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography variant="h6">Demo Journey</Typography>
                  <Stack spacing={1} sx={{ mt: 1.5 }}>
                    {[
                      "1. Guest scans table QR",
                      "2. Device opens branch-scoped menu",
                      "3. Order enters kitchen queue",
                      "4. Status syncs to kitchen and head office",
                    ].map((item) => (
                      <Box key={item} sx={{ p: 1.1, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.7)" }}>
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </AppShell>
    </>
  );
}
