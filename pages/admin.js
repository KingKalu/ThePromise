import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import { getBranches, getOverviewAnalytics } from "@/lib/api";

function levelForHour(value, maxHourly) {
  if (!value) return 0;
  const ratio = value / maxHourly;
  if (ratio > 0.66) return 3;
  if (ratio > 0.33) return 2;
  return 1;
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [a, b] = await Promise.all([getOverviewAnalytics(), getBranches()]);
        setAnalytics(a);
        setBranches(b);
      } catch (error) {
        console.error(error);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const branchTotals = analytics?.branchTotals || {};
  const hourly = analytics?.hourlyRevenue || {};
  const best = analytics?.bestSellers || {};
  const behavior = analytics?.behavior || {};

  const totalRevenue = useMemo(
    () => Object.values(branchTotals).reduce((acc, value) => acc + value, 0),
    [branchTotals],
  );

  const maxBranch = Math.max(1, ...Object.values(branchTotals), 1);
  const maxHourly = Math.max(1, ...Object.values(hourly), 1);

  return (
    <>
      <Head>
        <title>Head Office Dashboard | The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Central analytics workspace for branch performance, demand windows, best sellers, and customer behavior."
        />
      </Head>
      <AppShell footerText="Head office dashboard | Branch performance and behavior intelligence.">
        <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.2}
            sx={{ mb: 2.3 }}
          >
            <Box>
              <Typography variant="h4">Head Office Intelligence</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.6 }}>
                Unified performance visibility across all branches, products, and customer sessions.
              </Typography>
            </Box>
            <Chip label="Auto-refresh every 5s" color="primary" />
          </Stack>

          <Grid container spacing={1.8} sx={{ mb: 2.2 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Branches
                  </Typography>
                  <Typography variant="h4">{branches.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">NGN {totalRevenue.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Dine-in vs Takeaway
                  </Typography>
                  <Typography variant="h6">
                    {behavior.dineIn || 0} / {behavior.takeaway || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Avg Basket
                  </Typography>
                  <Typography variant="h5">
                    NGN {(behavior.avgBasket || 0).toFixed(0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={1.8} sx={{ mb: 2.2 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">Multi-Branch Performance</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
                    Revenue comparison by branch.
                  </Typography>
                  <Stack spacing={1.1}>
                    {branches.map((branch) => {
                      const value = branchTotals[branch.id] || 0;
                      const percentage = (value / maxBranch) * 100;
                      return (
                        <Box key={branch.id}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                            <Typography variant="body2">{branch.name}</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              NGN {value.toLocaleString()}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 10, borderRadius: 20, bgcolor: "rgba(122, 78, 43, 0.12)" }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card className="h-full bg-gradient-to-br from-amber-100 to-orange-100">
                <CardContent>
                  <Typography variant="h6">Peak Hour Heatmap</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
                    Hourly demand intensity for the active day.
                  </Typography>
                  <Grid container spacing={0.8}>
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const hour = idx + 11;
                      const value = hourly[hour] || 0;
                      const level = levelForHour(value, maxHourly);
                      const backgroundByLevel = {
                        0: "#fff6e8",
                        1: "#fde4b6",
                        2: "#f8bc61",
                        3: "#d65a31",
                      };
                      return (
                        <Grid size={{ xs: 3 }} key={hour}>
                          <Box
                            sx={{
                              borderRadius: 1.5,
                              p: 0.9,
                              textAlign: "center",
                              bgcolor: backgroundByLevel[level],
                              border: "1px solid rgba(60,36,0,0.12)",
                            }}
                            title={`${hour}:00`}
                          >
                            <Typography variant="caption" sx={{ display: "block" }}>
                              {hour}:00
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {value ? value.toLocaleString() : "-"}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={1.8}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">Best Sellers by Branch</Typography>
                  <TableContainer sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Branch</TableCell>
                          <TableCell>Best Item</TableCell>
                          <TableCell align="right">Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {branches.map((branch) => {
                          const row = best[branch.id];
                          return (
                            <TableRow key={branch.id}>
                              <TableCell>{branch.name}</TableCell>
                              <TableCell>{row?.name || "No data yet"}</TableCell>
                              <TableCell align="right">{row?.qty || "-"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">Customer Behavior</Typography>
                  <Stack spacing={1.2} sx={{ mt: 1.2 }}>
                    <Box sx={{ p: 1.2, borderRadius: 1.4, bgcolor: "rgba(245, 205, 140, 0.25)" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Dine-in Sessions
                      </Typography>
                      <Typography variant="h6">{behavior.dineIn || 0}</Typography>
                    </Box>
                    <Box sx={{ p: 1.2, borderRadius: 1.4, bgcolor: "rgba(245, 205, 140, 0.25)" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Takeaway Sessions
                      </Typography>
                      <Typography variant="h6">{behavior.takeaway || 0}</Typography>
                    </Box>
                    <Box sx={{ p: 1.2, borderRadius: 1.4, bgcolor: "rgba(245, 205, 140, 0.25)" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Repeat Customers
                      </Typography>
                      <Typography variant="h6">{behavior.repeatCustomers || 0}</Typography>
                    </Box>
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
