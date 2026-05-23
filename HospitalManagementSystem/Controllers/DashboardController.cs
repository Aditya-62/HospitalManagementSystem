using HospitalManagementSystem.Data;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public DashboardController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDashboardStats()
        {
            var totalPatients = _context.Patients.Count();
            var totalDoctors = _context.Doctors.Count();
            var totalAppointments = _context.Appointments.Count();
            var totalBills = _context.Bills.Sum(b => b.Amount);

            return Ok(new
            {
                totalPatients,
                totalDoctors,
                totalAppointments,
                totalRevenue = totalBills
            });
        }
    }
}