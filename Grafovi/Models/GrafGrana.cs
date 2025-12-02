namespace Grafovi.Models
{
    public class GrafGrana
    {
        public string ID { get; set; } = string.Empty;
        public GrafCvor pocetniCvor { get; set; } = null!;
        public GrafCvor krajnjiCvor { get; set; } = null!;
        public double tezina { get; set; } = 1.0;
        public bool usmerena { get; set; } = false;
    }
}