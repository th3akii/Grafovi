namespace Grafovi.Models
{
    public class GrafCvor
    {
        public int ID { get; set; }
        public string naziv { get; set; }
        public double x { get; set; }
        public double y { get; set; }
        public string boja { get; set; } = "LightGray";

        public GrafCvor(int id, string naziv)
        {
            ID = id;
            this.naziv = naziv;
        }
    }
}