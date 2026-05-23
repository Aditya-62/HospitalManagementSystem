namespace HospitalManagementSystem.Models
{
    public class Prescription
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? DoctorName { get; set; }
        public string? Medicines { get; set; }      // comma-separated or JSON string
        public string? Dosage { get; set; }
        public string? Instructions { get; set; }
        public string? Diagnosis { get; set; }
        public DateTime PrescribedDate { get; set; } = DateTime.Now;
    }
}
