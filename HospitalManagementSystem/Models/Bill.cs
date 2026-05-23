namespace HospitalManagementSystem.Models
{
    public class Bill
    {
        public int Id { get; set; }
        public string? PatientName { get; set; }
        public decimal Amount { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PatientUsername { get; set; }  // filter ke liye
    }
}
