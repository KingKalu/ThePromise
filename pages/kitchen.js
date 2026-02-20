import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import { getBranches, getOrders, updateOrderStatus } from "@/lib/api";

const ORDER_STEPS = ["Received", "In Kitchen", "Ready", "Served"];

function statusColor(status) {
  if (status === "Served") return "success";
  if (status === "Ready") return "secondary";
  if (status === "In Kitchen") return "warning";
  return "default";
}

export default function KitchenPage() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadBranches() {
      try {
        const loadedBranches = await getBranches();
        setBranches(loadedBranches);
        setBranchId(loadedBranches[0]?.id || "");
      } catch (error) {
        console.error(error);
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    let timer;
    async function pollOrders() {
      if (!branchId) return;
      try {
        const data = await getOrders(branchId);
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    }
    pollOrders();
    timer = setInterval(pollOrders, 3000);
    return () => clearInterval(timer);
  }, [branchId]);

  async function advanceOrder(order) {
    const nextIndex = Math.min((order.stepIndex || 0) + 1, ORDER_STEPS.length - 1);
    const nextStatus = ORDER_STEPS[nextIndex];
    try {
      await updateOrderStatus(order.id, nextStatus);
      const updated = await getOrders(branchId);
      setOrders(updated);
    } catch (error) {
      console.error(error);
    }
  }

  const metrics = useMemo(() => {
    const served = orders.filter((order) => order.status === "Served").length;
    const inKitchen = orders.filter((order) => order.status === "In Kitchen").length;
    const ready = orders.filter((order) => order.status === "Ready").length;
    const active = orders.length - served;
    return { served, inKitchen, ready, active };
  }, [orders]);

  const branchName = branches.find((branch) => branch.id === branchId)?.name;

  return (
    <>
      <Head>
        <title>Kitchen Dashboard | The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Kitchen operations workspace for live incoming orders, preparation flow, and service completion tracking."
        />
      </Head>
      <AppShell footerText="Kitchen dashboard | Real-time queue, dispatch pacing, and service completion.">
        <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.4} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.2 }}>
            <Box>
              <Typography variant="h4">Kitchen Command Center</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.6 }}>
                Track live orders by branch and move items from prep to service in one view.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                sx={{ minWidth: 220, bgcolor: "background.paper" }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              <Chip label="Live updates every 3s" color="primary" />
            </Stack>
          </Stack>

          <Grid container spacing={1.8} sx={{ mb: 2.2 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Orders Today
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Active Queue
                  </Typography>
                  <Typography variant="h4">{metrics.active}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    In Kitchen
                  </Typography>
                  <Typography variant="h4">{metrics.inKitchen}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Served
                  </Typography>
                  <Typography variant="h4">{metrics.served}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 2.2 }}>
            <CardContent>
              <Typography variant="h6">Live Orders {branchName ? `- ${branchName}` : ""}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
                Use the advance action to move orders through the kitchen flow.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Table</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{order.mode}</TableCell>
                        <TableCell>{order.tableCode || "-"}</TableCell>
                        <TableCell>{order.totalFormatted}</TableCell>
                        <TableCell>
                          <Chip size="small" label={order.status} color={statusColor(order.status)} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => advanceOrder(order)}
                            disabled={order.status === "Served"}
                          >
                            Advance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {orders.length === 0 ? (
                <Alert sx={{ mt: 1.5 }} severity="info">
                  No orders yet. Create an order from the customer module to see live kitchen activity.
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-100 to-orange-100">
            <CardContent>
              <Typography variant="h6">Service Flow Snapshot</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.4 }}>
                Fast glance at where workload is currently concentrated.
              </Typography>
              <Grid container spacing={1.2}>
                {ORDER_STEPS.map((step, index) => {
                  const count = orders.filter((order) => order.stepIndex >= index).length;
                  const percentage = orders.length ? (count / orders.length) * 100 : 0;
                  return (
                    <Grid key={step} size={{ xs: 12, md: 3 }}>
                      <Typography variant="body2" sx={{ mb: 0.4 }}>
                        {step}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 9, borderRadius: 20, bgcolor: "rgba(255,255,255,0.7)" }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {count} orders
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </AppShell>
    </>
  );
}
