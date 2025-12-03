namespace Grafovi.Models.Obrada
{
    public class Sused
    {
        public GrafCvor cvor;
        public double tezina;

        public Sused(GrafCvor cvor, double tezina)
        {
            this.cvor = cvor;
            this.tezina = tezina;
        }
    }

    public class ListaSusedstva
    {
        public Dictionary<int, List<Sused>> susedi { get; set;}
        public bool usmeren { get; set; }
        public bool tezinski { get; set; }

        public ListaSusedstva()
        {
            susedi = new Dictionary<int, List<Sused>>();
        }

        public static ListaSusedstva KreirajIzGrafa(Graf graf)
        {
            var lista = new ListaSusedstva
            {
                usmeren = graf.usmeren,
                tezinski = graf.tezinski
            };

            foreach (var cvor in graf.cvorovi)
            {
                lista.susedi[cvor.ID] = new List<Sused>();
            }

            foreach (var grana in graf.grane)
            {
                lista.susedi[grana.pocetniCvor.ID].Add(new Sused(grana.krajnjiCvor, grana.tezina));
                if (!graf.usmeren)
                {
                    lista.susedi[grana.krajnjiCvor.ID].Add(new Sused(grana.pocetniCvor, grana.tezina));
                }
            }

            return lista;
        }

        public List<Sused> GetSusedneCvorove(GrafCvor cvor)
        {
            return susedi.ContainsKey(cvor.ID) ? susedi[cvor.ID] : new List<Sused>();
        }

        public bool PostojiGrana(GrafCvor izCvor, GrafCvor uCvor)
        {
            if (!susedi.ContainsKey(izCvor.ID))
            {
                return false;
            }

            return susedi[izCvor.ID].Any(s => s.cvor.ID == uCvor.ID);
        }

        public void UkloniGranu(GrafCvor izCvor, GrafCvor uCvor)
        {
            if (!susedi.ContainsKey(izCvor.ID))
            {
            return;
            }

            susedi[izCvor.ID].RemoveAll(s => s.cvor.ID == uCvor.ID);

            if (!usmeren)
            {
                if (susedi.ContainsKey(uCvor.ID))
                {
                    susedi[uCvor.ID].RemoveAll(s => s.cvor.ID == izCvor.ID);
                }
            }
        }
    }
}