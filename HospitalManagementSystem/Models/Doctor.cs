using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models
{
    public class Doctor
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Specialization { get; set; }
        public string? Phone { get; set; }
        public int Experience { get; set; }
        public string? Qualification { get; set; }
        public string? PhotoUrl { get; set; }
        public string? AvailableDays { get; set; }   // e.g. "Mon,Tue,Wed"
        public string? TimingFrom { get; set; }       // e.g. "09:00"
        public string? TimingTo { get; set; }         // e.g. "17:00"
        public string? ConsultationFee { get; set; }
    }
}
