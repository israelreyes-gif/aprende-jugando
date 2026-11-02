// Países y nacionalidades de las tablas de su cuaderno (+ India, del ejercicio 6). Grupos por terminación.
const g = (group, rows) => rows.map(([country, es, nat]) => ({ country, es, nat, group }));
export const countries = [
  ...g('-ish', [['England', 'Inglaterra', 'English'], ['Ireland', 'Irlanda', 'Irish'], ['Spain', 'España', 'Spanish'], ['The UK', 'Reino Unido', 'British'], ['Denmark', 'Dinamarca', 'Danish'], ['Finland', 'Finlandia', 'Finnish'], ['Poland', 'Polonia', 'Polish'], ['Scotland', 'Escocia', 'Scottish'], ['Sweden', 'Suecia', 'Swedish'], ['Turkey', 'Turquía', 'Turkish']]),
  ...g('-ian', [['Argentina', 'Argentina', 'Argentinian'], ['Brazil', 'Brasil', 'Brazilian'], ['Canada', 'Canadá', 'Canadian'], ['Ecuador', 'Ecuador', 'Ecuadorian'], ['Italy', 'Italia', 'Italian'], ['Belgium', 'Bélgica', 'Belgian'], ['Bolivia', 'Bolivia', 'Bolivian'], ['Colombia', 'Colombia', 'Colombian'], ['Norway', 'Noruega', 'Norwegian'], ['Russia', 'Rusia', 'Russian'], ['Romania', 'Rumanía', 'Romanian'], ['India', 'India', 'Indian']]),
  ...g('-an', [['Australia', 'Australia', 'Australian'], ['Austria', 'Austria', 'Austrian'], ['Bulgaria', 'Bulgaria', 'Bulgarian'], ['The Dominican Republic', 'República Dominicana', 'Dominican'], ['Germany', 'Alemania', 'German'], ['Mexico', 'México', 'Mexican'], ['Morocco', 'Marruecos', 'Moroccan'], ['The USA', 'Estados Unidos', 'American'], ['Venezuela', 'Venezuela', 'Venezuelan']]),
  ...g('-ese', [['China', 'China', 'Chinese'], ['Portugal', 'Portugal', 'Portuguese'], ['Japan', 'Japón', 'Japanese']]),
  ...g('irregular', [['France', 'Francia', 'French'], ['Greece', 'Grecia', 'Greek'], ['Holland', 'Holanda', 'Dutch']]),
];
export const countryName = (c) => c.country.replace(/^The /, '');
export const inCountry = (c) => c.country;
