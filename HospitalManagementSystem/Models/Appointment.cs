namespace HospitalManagementSystem.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public string? PatientName { get; set; }
        public string? DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Status { get; set; }
        public string? AssignedNurse { get; set; }

        // Patient extra details
        public string? PatientUsername { get; set; }  // jo login kiya hai
        public string? PatientPhone { get; set; }
        public string? PatientAddress { get; set; }
        public string? PatientAge { get; set; }
        public string? PatientGender { get; set; }
        public string? Problem { get; set; }          // kya problem hai
        public string? Relation { get; set; }         // Self / Child / Wife / Other
        public string? TimeSlot { get; set; }         // e.g. "10:00 AM"
    }
}
