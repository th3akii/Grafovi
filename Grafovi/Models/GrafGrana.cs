namespace Grafovi.Models
{
    public class GrafGrana
    {
        public int ID { get; set; }
        public GrafCvor pocetniCvor { get; set; }
        public GrafCvor krajnjiCvor { get; set; }
        public double tezina { get; set; } = 1.0;
        public bool usmerena { get; set; } = false;
    }
}