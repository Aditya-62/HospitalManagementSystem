using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly HospitalDbContext _context;
        public DoctorController(HospitalDbContext context) { _context = context; }

        [HttpGet]
        public IActionResult GetDoctors() => Ok(_context.Doctors.ToList());

        [HttpGet("{id}")]
        public IActionResult GetDoctor(int id)
        {
            var d = _context.Doctors.FirstOrDefault(x => x.Id == id);
            return d == null ? NotFound() : Ok(d);
        }

        [HttpPost]
        public IActionResult AddDoctor(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            _context.SaveChanges();
            return Ok(doctor);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateDoctor(int id, Doctor u)
        {
            var d = _context.Doctors.FirstOrDefault(x => x.Id == id);
            if (d == null) return NotFound();
            d.Name = u.Name;
            d.Specialization = u.Specialization;
            d.Phone = u.Phone;
            d.Experience = u.Experience;
            d.Qualification = u.Qualification;
            d.PhotoUrl = u.PhotoUrl;
            d.AvailableDays = u.AvailableDays;
            d.TimingFrom = u.TimingFrom;
            d.TimingTo = u.TimingTo;
            d.ConsultationFee = u.ConsultationFee;
            _context.SaveChanges();
            return Ok(d);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDoctor(int id)
        {
            var d = _context.Doctors.FirstOrDefault(x => x.Id == id);
            if (d == null) return NotFound();
            _context.Doctors.Remove(d);
            _context.SaveChanges();
            return Ok("Deleted");
        }
    }
}
