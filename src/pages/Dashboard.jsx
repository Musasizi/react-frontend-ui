import { Typography, Box, Card, CardContent, Grid, Avatar, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';

export default function Dashboard() {
  // Example stats (replace with real data if available)
  const stats = [
    { label: 'Chapters', value: 8, icon: <MenuBookIcon fontSize="large" color="primary" /> },
    { label: 'Users', value: 24, icon: <GroupIcon fontSize="large" color="secondary" /> },
  ];

  return (
    <Box>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#fff', color: '#667eea', fontWeight: 700, fontSize: 32 }}>A</Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800}>Welcome, Admin!</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>Manage your chapters and users with ease.</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {stat.icon}
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                    <Typography color="text.secondary">{stat.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
