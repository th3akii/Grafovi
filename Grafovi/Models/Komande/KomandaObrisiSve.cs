namespace Grafovi.Models.Komande
{
    public class KomandaObrisiSve : IKomanda
    {
        private List<GrafCvor> obrisaniCvorovi = new List<GrafCvor>();
        private List<GrafGrana> obrisaneGrane = new List<GrafGrana>();

        public void Izvrsi(Graf graf)
        {
            obrisaniCvorovi = new List<GrafCvor>(graf.cvorovi);
            obrisaneGrane = new List<GrafGrana>(graf.grane);
            graf.cvorovi.Clear();
            graf.grane.Clear();
        }

        public void Ponisti(Graf graf)
        {
            foreach (var cvor in obrisaniCvorovi)
            {
                graf.cvorovi.Add(cvor);
            }
            foreach (var grana in obrisaneGrane)
            {
                graf.grane.Add(grana);
            }
        }
    }
}