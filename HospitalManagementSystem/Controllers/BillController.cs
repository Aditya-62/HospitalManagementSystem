using HospitalManagementSystem.Data;
using HospitalManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillController : ControllerBase
    {
        private readonly HospitalDbContext _context;
        public BillController(HospitalDbContext context) { _context = context; }

        [HttpGet]
        public IActionResult GetAll() => Ok(_context.Bills.ToList());

        [HttpGet("bypatient/{username}")]
        public IActionResult ByPatient(string username) =>
            Ok(_context.Bills.Where(b => b.PatientUsername == username).ToList());

        [HttpPost]
        public IActionResult Add(Bill bill)
        {
            _context.Bills.Add(bill);
            _context.SaveChanges();
            return Ok(bill);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Bill u)
        {
            var b = _context.Bills.FirstOrDefault(x => x.Id == id);
            if (b == null) return NotFound();
            b.PatientName = u.PatientName;
            b.Amount = u.Amount;
            b.PaymentStatus = u.PaymentStatus;
            b.PatientUsername = u.PatientUsername;
            _context.SaveChanges();
            return Ok(b);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var b = _context.Bills.FirstOrDefault(x => x.Id == id);
            if (b == null) return NotFound();
            _context.Bills.Remove(b);
            _context.SaveChanges();
            return Ok("Deleted");
        }
    }
}
