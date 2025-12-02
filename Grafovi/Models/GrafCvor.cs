namespace Grafovi.Models
{
    public class GrafCvor
    {
        public int ID { get; set; }
        public string naziv { get; set; }
        public string boja { get; set; } = "#97C2FC";

        public GrafCvor(int id, string naziv)
        {
            ID = id;
            this.naziv = naziv;
        }
    }
}