import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { CurrencyInput } from "@/components/ui/currency-input";

interface Addendum {
  id: string;
  number: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  monthlyValue: string;
  finalValue: string;
}

export function ContractRegistration() {
  const [contractNumber, setContractNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [commitmentNumber, setCommitmentNumber] = useState("");
  const [contractObject, setContractObject] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [monthlyValue, setMonthlyValue] = useState("");
  const [annualValue, setAnnualValue] = useState("0");
  const [addendums, setAddendums] = useState<Addendum[]>([]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return value;
  };

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length !== 14) return false;
    
    // Validação básica de CNPJ
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return (
      digit1 === parseInt(numbers[12]) && digit2 === parseInt(numbers[13])
    );
  };

  const handleMonthlyValueChange = (formatted: string, numericValue: number) => {
    setMonthlyValue(formatted);
    const annual = numericValue * 12;
    setAnnualValue(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(annual)
    );
  };

  const handleAddendumMonthlyChange = (id: string, formatted: string, numericValue: number) => {
    setAddendums(
      addendums.map((add) => {
        if (add.id === id) {
          const final = numericValue * 12;
          return {
            ...add,
            monthlyValue: formatted,
            finalValue: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(final),
          };
        }
        return add;
      })
    );
  };

  const addAddendum = (number: string) => {
    const newAddendum: Addendum = {
      id: Math.random().toString(),
      number,
      startDate: undefined,
      endDate: undefined,
      monthlyValue: "",
      finalValue: "R$ 0,00",
    };
    setAddendums([...addendums, newAddendum]);
  };

  const removeAddendum = (id: string) => {
    setAddendums(addendums.filter((add) => add.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCNPJ(cnpj)) {
      toast.error("CNPJ inválido");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Por favor, preencha as datas de vigência");
      return;
    }

    // Aqui você salvaria os dados no banco
    console.log({
      contractNumber,
      companyName,
      cnpj,
      commitmentNumber,
      contractObject,
      startDate,
      endDate,
      monthlyValue,
      annualValue,
      addendums,
    });

    toast.success("Contrato cadastrado com sucesso!");
    
    // Limpar formulário
    setContractNumber("");
    setCompanyName("");
    setCnpj("");
    setCommitmentNumber("");
    setContractObject("");
    setStartDate(undefined);
    setEndDate(undefined);
    setMonthlyValue("");
    setAnnualValue("0");
    setAddendums([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais do Contrato</CardTitle>
          <CardDescription>
            Preencha as informações básicas do contrato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Número do Contrato</Label>
              <Input
                id="contractNumber"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ da Empresa</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commitmentNumber">Número do Empenho Vigente</Label>
              <Input
                id="commitmentNumber"
                value={commitmentNumber}
                onChange={(e) => setCommitmentNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractObject">Objeto do Contrato</Label>
            <Textarea
              id="contractObject"
              value={contractObject}
              onChange={(e) => setContractObject(e.target.value)}
              placeholder="Descrição detalhada do objeto do contrato"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial da Vigência</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Final da Vigência</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyValue">Valor Mensal</Label>
              <CurrencyInput
                id="monthlyValue"
                value={monthlyValue}
                onValueChange={handleMonthlyValueChange}
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualValue">Valor Anual (calculado)</Label>
              <Input
                id="annualValue"
                value={annualValue}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termos Aditivos</CardTitle>
          <CardDescription>
            Adicione termos aditivos de renovação do contrato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Adicionar Termo Aditivo</Label>
            <Select
              onValueChange={(value) => addAddendum(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um termo aditivo" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={`${num}º Aditivo de Renovação`}>
                    {num}º Aditivo de Renovação
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {addendums.map((addendum) => (
            <Card key={addendum.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{addendum.number}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddendum(addendum.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial do Aditivo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !addendum.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {addendum.startDate ? (
                            format(addendum.startDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={addendum.startDate}
                          onSelect={(date) =>
                            setAddendums(
                              addendums.map((add) =>
                                add.id === addendum.id
                                  ? { ...add, startDate: date }
                                  : add
                              )
                            )
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Final do Aditivo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !addendum.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {addendum.endDate ? (
                            format(addendum.endDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={addendum.endDate}
                          onSelect={(date) =>
                            setAddendums(
                              addendums.map((add) =>
                                add.id === addendum.id
                                  ? { ...add, endDate: date }
                                  : add
                              )
                            )
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Mensal do Aditivo</Label>
                    <CurrencyInput
                      value={addendum.monthlyValue}
                      onValueChange={(formatted, numericValue) =>
                        handleAddendumMonthlyChange(addendum.id, formatted, numericValue)
                      }
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Anual do Aditivo (calculado)</Label>
                    <Input
                      value={addendum.finalValue}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Contrato
        </Button>
      </div>
    </form>
  );
}
