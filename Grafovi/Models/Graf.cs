namespace Grafovi.Models
{
    public class Graf
    {
        public int ID { get; set; }
        public string naziv { get; set; }
        public List<GrafCvor> cvorovi { get; set; }
        public List<GrafGrana> grane { get; set; }

        public Graf()
        {
            cvorovi = new List<GrafCvor>();
            grane = new List<GrafGrana>();
        }
    }
}