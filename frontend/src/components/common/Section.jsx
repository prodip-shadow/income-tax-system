import Container from "./Container";

const Section = ({
  children,
  className = "",
  containerClassName = "",
}) => {
  return (
    <section className={`py-12 md:py-16 lg:py-20 ${className}`}>
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  );
};

export default Section;