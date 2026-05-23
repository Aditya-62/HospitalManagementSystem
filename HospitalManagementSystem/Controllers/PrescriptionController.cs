using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly HospitalDbContext _context;
        public PrescriptionController(HospitalDbContext context) => _context = context;

        // GET ALL
        [HttpGet]
        public IActionResult GetAll() => Ok(_context.Prescriptions.ToList());

        // GET BY PATIENT ID
        [HttpGet("bypatient/{patientId}")]
        public IActionResult GetByPatient(int patientId) =>
            Ok(_context.Prescriptions.Where(p => p.PatientId == patientId).ToList());

        // GET BY PATIENT NAME (for patient login)
        [HttpGet("bypatientname/{name}")]
        public IActionResult GetByPatientName(string name) =>
            Ok(_context.Prescriptions.Where(p => p.PatientName != null && p.PatientName.ToLower() == name.ToLower()).ToList());

        // ADD
        [HttpPost]
        public IActionResult Add(Prescription prescription)
        {
            prescription.PrescribedDate = DateTime.Now;
            _context.Prescriptions.Add(prescription);
            _context.SaveChanges();
            return Ok(prescription);
        }

        // UPDATE
        [HttpPut("{id}")]
        public IActionResult Update(int id, Prescription updated)
        {
            var p = _context.Prescriptions.FirstOrDefault(x => x.Id == id);
            if (p == null) return NotFound();
            p.Medicines = updated.Medicines;
            p.Dosage = updated.Dosage;
            p.Instructions = updated.Instructions;
            p.Diagnosis = updated.Diagnosis;
            _context.SaveChanges();
            return Ok(p);
        }

        // DELETE
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var p = _context.Prescriptions.FirstOrDefault(x => x.Id == id);
            if (p == null) return NotFound();
            _context.Prescriptions.Remove(p);
            _context.SaveChanges();
            return Ok("Deleted");
        }
    }
}
