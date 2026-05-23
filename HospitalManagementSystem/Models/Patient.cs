using System.ComponentModel.DataAnnotations;

namespace HospitalManagementSystem.Models
{
    public class Patient
    {
        public int Id { get; set; }

        [Required]
        public string? Name { get; set; }

        [Range(1, 120)]
        public int Age { get; set; }

        [Required]
        public string? Gender { get; set; }

        [Required]
        public string? Disease { get; set; }

        [Phone]
        public string? Phone { get; set; }

        // Patient ka login username (register ke waqt link hoga)
        public string? AssignedUsername { get; set; }

        // Assigned nurse
        public string? AssignedNurse { get; set; }
    }
}