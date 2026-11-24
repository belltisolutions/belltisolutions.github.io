"use strict";

const whatsappNumber = "5547997438987";
const form = document.querySelector("#form-orcamento");
const nameField = form.elements.namedItem("nome");
const serviceField = form.elements.namedItem("servico");
const detailsField = form.elements.namedItem("detalhes");
const submitButton = document.querySelector("#enviar-orcamento");

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    serviceField.value = card.dataset.service;
  });
});

nameField.addEventListener("input", () => nameField.setCustomValidity(""));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameField.value.trim();
  nameField.setCustomValidity(name ? "" : "Informe seu nome ou o nome da empresa.");
  if (!form.reportValidity()) return;

  const service = serviceField.selectedOptions[0].textContent.trim();
  const details = detailsField.value.trim();
  const lines = [
    "Olá! Gostaria de solicitar um orçamento à Bell Soluções em Tecnologia.",
    "",
    `Nome ou empresa: ${name}`,
    `Serviço: ${service}`,
  ];

  if (details) lines.push(`Detalhes: ${details}`);

  const message = encodeURIComponent(lines.join("\n"));
  window.location.assign(`https://wa.me/${whatsappNumber}?text=${message}`);
});

submitButton.disabled = false;
