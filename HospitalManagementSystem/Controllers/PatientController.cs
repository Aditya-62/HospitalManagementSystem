using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public PatientController(HospitalDbContext context)
        {
            _context = context;
        }

        // GET ALL PATIENTS (Admin)
        [HttpGet]
        public IActionResult GetPatients()
        {
            return Ok(_context.Patients.ToList());
        }

        // GET PATIENTS BY USERNAME (Patient login - sirf apna data)
        [HttpGet("byuser/{username}")]
        public IActionResult GetPatientsByUsername(string username)
        {
            var patients = _context.Patients
                .Where(p => p.AssignedUsername == username)
                .ToList();
            return Ok(patients);
        }

        // ADD PATIENT
        [HttpPost]
        public IActionResult AddPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            _context.SaveChanges();
            return Ok(patient);
        }

        // UPDATE PATIENT
        [HttpPut("{id}")]
        public IActionResult UpdatePatient(int id, Patient updatedPatient)
        {
            var patient = _context.Patients.FirstOrDefault(p => p.Id == id);
            if (patient == null) return NotFound();

            patient.Name = updatedPatient.Name;
            patient.Age = updatedPatient.Age;
            patient.Gender = updatedPatient.Gender;
            patient.Disease = updatedPatient.Disease;
            patient.Phone = updatedPatient.Phone;
            patient.AssignedUsername = updatedPatient.AssignedUsername;
            patient.AssignedNurse = updatedPatient.AssignedNurse;

            _context.SaveChanges();
            return Ok(patient);
        }

        // ASSIGN NURSE TO PATIENT
        [HttpPut("{id}/assignnurse")]
        public IActionResult AssignNurse(int id, [FromBody] string nurseName)
        {
            var patient = _context.Patients.FirstOrDefault(p => p.Id == id);
            if (patient == null) return NotFound();

            patient.AssignedNurse = nurseName;
            _context.SaveChanges();
            return Ok(patient);
        }

        // DELETE PATIENT
        [HttpDelete("{id}")]
        public IActionResult DeletePatient(int id)
        {
            var patient = _context.Patients.FirstOrDefault(p => p.Id == id);
            if (patient == null) return NotFound();

            _context.Patients.Remove(patient);
            _context.SaveChanges();
            return Ok("Patient Deleted Successfully");
        }
    }
}
