namespace Grafovi.Models.Obrada
{
    public class ListaSusedstva
    {
        public Dictionary<int, List<GrafCvor>> susedi { get; set;}
        public bool usmeren { get; set; }
        public bool tezinski { get; set; }

        public ListaSusedstva()
        {
            susedi = new Dictionary<int, List<GrafCvor>>();
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
                lista.susedi[cvor.ID] = new List<GrafCvor>();
            }

            foreach (var grana in graf.grane)
            {
                lista.susedi[grana.pocetniCvor.ID].Add(grana.krajnjiCvor);
                if (!graf.usmeren)
                {
                    lista.susedi[grana.krajnjiCvor.ID].Add(grana.pocetniCvor);
                }
            }

            return lista;
        }

        public List<GrafCvor> GetSusedneCvorove(GrafCvor cvor)
        {
            return susedi.ContainsKey(cvor.ID) ? susedi[cvor.ID] : new List<GrafCvor>();
        }

        public bool PostojiGrana(GrafCvor izCvor, GrafCvor uCvor)
        {
            if (!susedi.ContainsKey(izCvor.ID))
            {
                return false;
            }

            return susedi[izCvor.ID].Any(s => s.ID == uCvor.ID);
        }

        public void UkloniGranu(GrafCvor izCvor, GrafCvor uCvor)
        {
            if (!susedi.ContainsKey(izCvor.ID))
            {
            return;
            }

            susedi[izCvor.ID].RemoveAll(s => s.ID == uCvor.ID);

            if (!usmeren)
            {
                if (susedi.ContainsKey(uCvor.ID))
                {
                    susedi[uCvor.ID].RemoveAll(s => s.ID == izCvor.ID);
                }
            }
        }
    }
}