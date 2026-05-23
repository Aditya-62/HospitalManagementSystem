using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly HospitalDbContext _context;
        public AppointmentController(HospitalDbContext context) { _context = context; }

        // Admin - sab
        [HttpGet]
        public IActionResult GetAll() => Ok(_context.Appointments.ToList());

        // Doctor - apne patients
        [HttpGet("bydoctor/{doctorName}")]
        public IActionResult ByDoctor(string doctorName) =>
            Ok(_context.Appointments.Where(a => a.DoctorName!.ToLower() == doctorName.ToLower()).ToList());

        // Patient - apne appointments
        [HttpGet("bypatient/{username}")]
        public IActionResult ByPatient(string username) =>
            Ok(_context.Appointments.Where(a => a.PatientUsername == username).ToList());

        // Nurse
        [HttpGet("bynurse/{nurseName}")]
        public IActionResult ByNurse(string nurseName) =>
            Ok(_context.Appointments.Where(a => a.AssignedNurse != null && a.AssignedNurse.ToLower() == nurseName.ToLower()).ToList());

        [HttpPost]
        public IActionResult Add(Appointment a)
        {
            _context.Appointments.Add(a);
            _context.SaveChanges();
            return Ok(a);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Appointment u)
        {
            var a = _context.Appointments.FirstOrDefault(x => x.Id == id);
            if (a == null) return NotFound();
            a.PatientName = u.PatientName;
            a.DoctorName = u.DoctorName;
            a.AppointmentDate = u.AppointmentDate;
            a.Status = u.Status;
            a.AssignedNurse = u.AssignedNurse;
            a.PatientUsername = u.PatientUsername;
            a.PatientPhone = u.PatientPhone;
            a.PatientAddress = u.PatientAddress;
            a.PatientAge = u.PatientAge;
            a.PatientGender = u.PatientGender;
            a.Problem = u.Problem;
            a.Relation = u.Relation;
            a.TimeSlot = u.TimeSlot;
            _context.SaveChanges();
            return Ok(a);
        }

        [HttpPut("{id}/assignnurse")]
        public IActionResult AssignNurse(int id, [FromBody] string nurseName)
        {
            var a = _context.Appointments.FirstOrDefault(x => x.Id == id);
            if (a == null) return NotFound();
            a.AssignedNurse = nurseName;
            _context.SaveChanges();
            return Ok(a);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var a = _context.Appointments.FirstOrDefault(x => x.Id == id);
            if (a == null) return NotFound();
            _context.Appointments.Remove(a);
            _context.SaveChanges();
            return Ok("Deleted");
        }
    }
}
